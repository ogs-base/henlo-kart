import { db } from "@/db";
import { agents } from "@/db/schema";
import { xpToPercent } from "@/utils/xpToPercent";
import { eq } from "drizzle-orm";
import { z } from "zod";

async function getPlayers(tokenId: number) {
  return await db.query.agents
    .findFirst({
      where: eq(agents.tokenId, tokenId),
      columns: {},
      with: {
        lastRace: {
          columns: {
            winner: true,
          },
          with: {
            commitmentsToRaces: {
              columns: {},
              with: {
                commitment: {
                  columns: {},
                  with: {
                    player: {
                      columns: {
                        address: true,
                        betsLost: true,
                        betsWon: true,
                        lastRaceBet: true,
                        lastRaceResult: true,
                        level: true,
                        racesLost: true,
                        racesWon: true,
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
      players: res?.lastRace?.commitmentsToRaces.map(
        ({ commitment: { player } }) => player
      ),
      winner: res?.lastRace?.winner,
    }));
}

export const schema = z.object({
  racesWon: z.coerce.string(),
  racesLost: z.coerce.string(),
  betsLost: z
    .string()
    .transform((val) => (BigInt(val) / BigInt(10 ** 18)).toString()),
  betsWon: z
    .string()
    .transform((val) => (BigInt(val) / BigInt(10 ** 18)).toString()),
  lastRaceBet: z
    .string()
    .transform((val) => (BigInt(val) / BigInt(10 ** 18)).toString()),
  lastRaceResult: z
    .boolean()
    .transform((val) => (val ? "🏆 won 🏆" : "😔 lost 😔")),
  level: z.number(),
  xp: z.number(),
});

async function getData(tokenId: number, retries = 0) {
  const data = await getPlayers(tokenId);

  if (
    (data.players === undefined || data.players.length === 0) &&
    retries < 15
  ) {
    console.log("players not found, retrying in 0.5 seconds...");
    await new Promise((resolve) => setTimeout(resolve, 500));
    return getData(tokenId, retries + 1);
  }

  return data;
}

async function getPlayerVsPlayerStats(tokenId: number) {
  const rawData = await getData(tokenId);

  const { players, winner } = z
    .object({
      players: schema.extend({ address: z.string() }).array(),
      winner: z.string(),
    })
    .parse(rawData);

  const data = players.map((player) => ({
    ...player,
    lastRaceResult: player.address === winner ? "🏆 won 🏆" : "😔 lost 😔",
    totalRaces: `${BigInt(player.racesLost) + BigInt(player.racesWon)}`,
    totalWon: `${BigInt(player.betsWon) - BigInt(player.betsLost)}`,
    percentage: xpToPercent(player.xp, player.level, "player"),
  }));

  return data;
}

export { getPlayerVsPlayerStats };
