import { ogsNftAbi } from "@/abis/ogs-nft-abi";
import { db } from "@/db";
import { agents, players, races } from "@/db/schema";
import { ogsNft, publicClientBase } from "@/event-listener";
import { raceFinishedSchema } from "@/schema";
import { getAgentData } from "@/utils/agent";
import { addCommitmentsToRace, getCommitmentsInRace } from "@/utils/commitment";
import { createPlayerIfNotExist, getPlayerData } from "@/utils/player";
import { getAgentLevelFromXp, getPlayerLevelFromXp, getXp } from "@/utils/xp";
import { eq } from "drizzle-orm";
import { Address } from "viem";

async function handleRaceFinished(logs: any) {
  console.log("RACE FINISHED");
  try {
    const args = logs[0]?.args;

    const { commitmentHashes, steps, ...race } = raceFinishedSchema.parse(args);

    console.log({ commitmentHashes, steps, race });

    const { insertId: raceId } = await db.insert(races).values(race);

    console.log("CREATED RACE", race);

    await addCommitmentsToRace(commitmentHashes, race.raceId);

    await createPlayerIfNotExist(race.executor as Address);

    const commitmentsInRace = await getCommitmentsInRace(race.raceId);

    for (const { tokenId, player: address } of commitmentsInRace) {
      const agent = await getAgentData(tokenId);

      const player = await getPlayerData(address as Address);

      const isWinner = tokenId === race.winningTokenId;

      console.log({
        tokenId,
        winningTokenId: race.winningTokenId,
        isWinner,
      });

      const agentOwner = await publicClientBase.readContract({
        abi: ogsNftAbi,
        address: ogsNft,
        functionName: "ownerOf",
        args: [BigInt(tokenId)],
      });

      await createPlayerIfNotExist(agentOwner);

      const owner = await getPlayerData(agentOwner);

      if (isWinner) {
        console.log("WINNER");

        let agentXp = agent.xp;
        let newAgentLevel = agent.level;
        let playerXp = player.xp;
        let newPlayerLevel = player.level;
        let agentOwnerXp = owner.xp;
        let newAgentOwnerLevel = owner.level;

        if (agent.level < 10) {
          agentXp = getXp(steps, agent.level, agent.xp, true);
          newAgentLevel = getAgentLevelFromXp(agentXp);
          playerXp = getXp(steps, player.level, player.xp, true);
          newPlayerLevel = getPlayerLevelFromXp(playerXp);
          agentOwnerXp = getXp(steps, owner.level, owner.xp, true);
          newAgentOwnerLevel = getPlayerLevelFromXp(agentOwnerXp);
        }

        console.log({ agentXp, newAgentLevel, playerXp, newPlayerLevel });

        const agentNewData = {
          betsWon: `${BigInt(agent.betsWon) + BigInt(race.betSize)}`,
          racesWon: agent.racesWon + BigInt(1),
          level: newAgentLevel,
          xp: agentXp,
          lastRaceResult: true,
          lastRaceBet: BigInt(race.betSize).toString(),
          lastRaceId: BigInt(raceId),
          masteryTime:
            agent.level === 9 && newAgentLevel === 10 ? new Date() : undefined,
        };

        await db
          .update(agents)
          .set(agentNewData)
          .where(eq(agents.tokenId, tokenId));

        console.log("UPDATED AGENT STATS FOR WINNER", agentNewData);

        const playerNewData = {
          betsWon: `${BigInt(player.betsWon) + BigInt(race.betSize)}`,
          racesWon: player.racesWon + BigInt(1),
          level: newPlayerLevel,
          xp: playerXp,
          lastRaceResult: true,
          lastRaceBet: BigInt(race.betSize).toString(),
          masteryTime:
            player.level === 9 && newPlayerLevel === 10
              ? new Date()
              : undefined,
        };

        await db
          .update(players)
          .set(playerNewData)
          .where(eq(players.address, address));

        console.log("UPDATED PLAYER STATS FOR WINNER", playerNewData);

        const agentOwnerNewData = {
          betsWon: `${BigInt(owner.betsWon) + BigInt(race.betSize)}`,
          racesWon: owner.racesWon + BigInt(1),
          level: newAgentOwnerLevel,
          xp: agentOwnerXp,
          lastRaceResult: true,
          lastRaceBet: BigInt(race.betSize).toString(),
          masteryTime:
            owner.level === 9 && newAgentOwnerLevel === 10
              ? new Date()
              : undefined,
        };

        await db
          .update(players)
          .set(agentOwnerNewData)
          .where(eq(players.address, agentOwner));

        console.log("UPDATED AGENT OWNER STATS FOR WINNER", agentOwnerNewData);
      }

      if (!isWinner) {
        console.log("LOSER");

        let agentXp = agent.xp;
        let newAgentLevel = agent.level;
        let playerXp = player.xp;
        let newPlayerLevel = player.level;
        let agentOwnerXp = owner.xp;
        let newAgentOwnerLevel = owner.level;

        if (agent.level < 10) {
          agentXp = getXp(steps, agent.level, agent.xp, false);
          newAgentLevel = getAgentLevelFromXp(agentXp);
          playerXp = getXp(steps, player.level, player.xp, false);
          newPlayerLevel = getPlayerLevelFromXp(playerXp);
          agentOwnerXp = getXp(steps, owner.level, owner.xp, false);
          newAgentOwnerLevel = getPlayerLevelFromXp(agentOwnerXp);
        }

        console.log({ agentXp, newAgentLevel, playerXp, newPlayerLevel });

        const agentNewData = {
          betsLost: `${BigInt(agent.betsLost) + BigInt(race.betSize)}`,
          racesLost: agent.racesLost + BigInt(1),
          level: newAgentLevel,
          xp: agentXp,
          lastRaceResult: false,
          lastRaceBet: BigInt(race.betSize).toString(),
          lastRaceId: BigInt(raceId),
          masteryTime:
            agent.level === 9 && newAgentLevel === 10 ? new Date() : undefined,
        };

        await db
          .update(agents)
          .set(agentNewData)
          .where(eq(agents.tokenId, tokenId));

        console.log("UPDATED AGENT STATS FOR LOSER", agentNewData);

        const playerNewData = {
          betsLost: `${BigInt(player.betsLost) + BigInt(race.betSize)}`,
          racesLost: player.racesLost + BigInt(1),
          level: newPlayerLevel,
          xp: playerXp,
          lastRaceResult: false,
          lastRaceBet: BigInt(race.betSize).toString(),
          masteryTime:
            player.level === 9 && newPlayerLevel === 10
              ? new Date()
              : undefined,
        };

        await db
          .update(players)
          .set(playerNewData)
          .where(eq(players.address, address));

        console.log("UPDATED PLAYER STATS FOR LOSER", playerNewData);

        const agentOwnerNewData = {
          betsLost: `${BigInt(owner.betsLost) + BigInt(race.betSize)}`,
          racesLost: owner.racesLost + BigInt(1),
          level: newAgentOwnerLevel,
          xp: agentOwnerXp,
          lastRaceResult: false,
          lastRaceBet: BigInt(race.betSize).toString(),
          masteryTime:
            owner.level === 9 && newAgentOwnerLevel === 10
              ? new Date()
              : undefined,
        };

        await db
          .update(players)
          .set(agentOwnerNewData)
          .where(eq(players.address, agentOwner));

        console.log("UPDATED AGENT OWNER STATS FOR LOSER", agentOwnerNewData);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

export { handleRaceFinished };
