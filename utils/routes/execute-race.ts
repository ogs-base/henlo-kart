import { db } from "@/db";
import { commitments } from "@/db/schema";
import { betToken, hamsterRaceV1 } from "@/utils/variables";
import { Address } from "viem";
import { and, desc, eq, gt, lt, ne } from "drizzle-orm";
import { z } from "zod";
import { abi } from "@/abis/abi";
import { shuffleArray } from "@/utils/random";
import { getPublicClient } from "@/client-singleton";

const publicClient = getPublicClient();

const now = new Date(new Date().toString().slice(0, -3));

async function getPlayerStats({
  betSize,
  tokenId,
  player,
}: {
  betSize: string;
  tokenId: number;
  player: string;
}) {
  return await db.query.commitments.findFirst({
    where: and(
      eq(commitments.tokenId, tokenId),
      eq(commitments.player, player),
      eq(commitments.betToken, betToken),
      eq(commitments.betSize, betSize.toString()),
      gt(commitments.deadline, now),
      lt(commitments.usedCount, commitments.count)
    ),
    columns: {
      commitmentHash: true,
    },
  });
}

async function getDataFromDatabase({
  betSize,
  tokenId,
  player,
  retries,
}: {
  betSize: string;
  tokenId: number;
  player: string;
  retries: number;
}) {
  const data = await getPlayerStats({ betSize, tokenId, player });

  if (data === undefined && retries < 10) {
    console.log("Commitment not found, retrying in 0.5 seconds...");
    await new Promise((resolve) => setTimeout(resolve, 500));
    return getDataFromDatabase({
      betSize,
      tokenId,
      player,
      retries: retries + 1,
    });
  }

  return data;
}

async function getValidCommitments(
  player: Address,
  betSize: string,
  tokenId: number
) {
  const playerCommitment = await getDataFromDatabase({
    betSize,
    tokenId,
    player,
    retries: 0,
  });

  const commitmentHash = z
    .string()
    .parse(playerCommitment?.commitmentHash) as Address;

  let validCommitments: Address[] = [commitmentHash];

  let raceCommitments = await db.query.commitments.findMany({
    where: and(
      ne(commitments.tokenId, tokenId),
      eq(commitments.betToken, betToken),
      eq(commitments.betSize, betSize.toString()),
      gt(commitments.deadline, now),
      lt(commitments.usedCount, commitments.count)
    ),
    columns: {
      agent: true,
      betSize: true,
      betToken: true,
      commitmentHash: true,
    },
    limit: 35,
    orderBy: [desc(commitments.deadline)],
  });

  raceCommitments = shuffleArray(raceCommitments);

  const validRaces = await Promise.all(
    raceCommitments.filter(async (commitment) => {
      const { agent, betSize, betToken, commitmentHash } = z
        .object({
          agent: z.string(),
          betSize: z.coerce.bigint(),
          betToken: z.string(),
          commitmentHash: z.string(),
        })
        .parse(commitment);

      try {
        const isValid = await publicClient.readContract({
          abi,
          address: hamsterRaceV1,
          functionName: "isValidCommitment",
          args: [
            agent as Address,
            betToken as Address,
            BigInt(tokenId),
            betSize,
            commitmentHash as Address,
          ],
        });

        return isValid;
      } catch (error) {
        console.log(error);
      }
    })
  );

  if (validRaces[0].commitmentHash !== null) {
    validCommitments.push(validRaces[0].commitmentHash as Address);
  }

  const readyToRace = validCommitments.length === 2;

  if (!readyToRace) throw "not ready to race";

  return validCommitments;
}

export { getValidCommitments };
