import { db } from "@/db";
import { agents } from "@/db/schema";
import { queryAgentStats } from "@/utils/routes/agent-stats";
import { schema } from "@/utils/routes/player-vs-player";
import { xpToPercent } from "@/utils/xpToPercent";
import { eq } from "drizzle-orm";
import { z } from "zod";

async function getAgents(tokenId: number) {
  return await db.query.agents
    .findFirst({
      where: eq(agents.tokenId, tokenId),
      columns: {},
      with: {
        lastRace: {
          columns: {
            winningTokenId: true,
          },
          with: {
            commitmentsToRaces: {
              columns: {},
              with: {
                commitment: {
                  columns: {},
                  with: {
                    agent: {
                      columns: {
                        betsLost: true,
                        betsWon: true,
                        lastRaceBet: true,
                        lastRaceResult: true,
                        level: true,
                        racesLost: true,
                        racesWon: true,
                        tokenId: true,
                        xp: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })
    .then((res) => ({
      agents: res?.lastRace?.commitmentsToRaces.map(
        ({ commitment: { agent } }) => agent
      ),
      winningTokenId: res?.lastRace?.winningTokenId,
    }));
}

async function getAgentVsAgentStats(tokenId: number) {
  let rawData = await getAgents(tokenId);

  const hasNoLastRace = rawData.agents === undefined;

  let agentStats: Awaited<ReturnType<typeof queryAgentStats>>[] = [];

  if (hasNoLastRace) agentStats = [await queryAgentStats(tokenId)];

  const winningTokenId = z.number().safeParse(rawData.winningTokenId);

  const agents = schema
    .extend({ tokenId: z.number() })
    .array()
    .parse(hasNoLastRace ? agentStats : rawData.agents);

  const data = agents.map((agent) => ({
    ...agent,
    lastRaceResult: winningTokenId.success
      ? agent.tokenId === winningTokenId.data
        ? "🏆 won 🏆"
        : "😔 lost 😔"
      : agent.lastRaceResult,
    totalRaces: `${BigInt(agent.racesLost) + BigInt(agent.racesWon)}`,
    totalWon: `${BigInt(agent.betsWon) - BigInt(agent.betsLost)}`,
    percentage: xpToPercent(agent.xp, agent.level, "agent"),
  }));

  return data;
}

export { getAgentVsAgentStats };
