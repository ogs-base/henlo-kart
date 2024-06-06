import { db } from "@/db";
import { players } from "@/db/schema";
import { schema } from "@/utils/routes/player-vs-player";
import { xpToPercent } from "@/utils/xpToPercent";
import { eq } from "drizzle-orm";
import { Address } from "viem";
import { z } from "zod";

async function getPlayerStats(player: string) {
  return await db.query.players.findFirst({
    where: eq(players.address, player),
    columns: {
      betsLost: true,
      betsWon: true,
      lastRaceBet: true,
      lastRaceResult: true,
      racesLost: true,
      racesWon: true,
      level: true,
      xp: true,
      address: true,
    },
  });
}

async function getDataFromDatabase(player: string, retries = 0) {
  const data = await getPlayerStats(player);

  if (data === undefined && retries < 10) {
    console.log("Player not found, retrying in 0.5 seconds...");
    await new Promise((resolve) => setTimeout(resolve, 500));
    return getDataFromDatabase(player, retries + 1);
  }

  return data;
}

async function getPlayerStatsData(address: Address) {
  const playerStatsData = await getDataFromDatabase(address);

  const player = schema
    .extend({
      address: z.string(),
    })
    .parse(playerStatsData);

  const totalRaces = `${BigInt(player.racesLost) + BigInt(player.racesWon)}`;
  const totalWon = `${BigInt(player.betsWon) - BigInt(player.betsLost)}`;

  const percentage = xpToPercent(player.xp, player.level, "player");

  return {
    ...player,
    totalRaces,
    totalWon,
    percentage,
  };
}

export { getPlayerStatsData };
