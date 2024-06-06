import { db } from "@/db";
import { players } from "@/db/schema";
import { eq } from "drizzle-orm";
import { type Address } from "viem";
import { z } from "zod";

async function createPlayer(address: Address) {
  return await db.insert(players).values({
    betsLost: BigInt(0).toString(),
    betsWon: BigInt(0).toString(),
    racesLost: BigInt(0),
    racesWon: BigInt(0),
    lastRaceBet: BigInt(0).toString(),
    lastRaceResult: false,
    level: 1,
    xp: 0,
    address,
  });
}

async function getPlayerExists(player: Address) {
  const response = await db.query.players.findFirst({
    where: eq(players.address, player),
    columns: { address: true },
  });

  return Boolean(response?.address);
}

async function createPlayerIfNotExist(address: Address) {
  const playerExists = await getPlayerExists(address);

  if (!playerExists) {
    await createPlayer(address);
  }
}

async function getPlayerData(player: Address) {
  const playerRow = await db.query.players.findFirst({
    where: eq(players.address, player),
    columns: {
      betsWon: true,
      racesWon: true,
      betsLost: true,
      racesLost: true,
      xp: true,
      level: true,
    },
  });

  const data = z
    .object({
      betsWon: z.string(),
      racesWon: z.bigint(),
      betsLost: z.string(),
      racesLost: z.bigint(),
      xp: z.number(),
      level: z.number(),
    })
    .parse(playerRow);

  console.log(data);

  return data;
}

export { createPlayer, getPlayerExists, createPlayerIfNotExist, getPlayerData };
