import { db } from "@/db";
import { commitments } from "@/db/schema";
import { betToken, hamsterRaceV1 } from "@/utils/variables";
import { Address } from "viem";
import { and, desc, eq, gt, lt, ne } from "drizzle-orm";
import { z } from "zod";
import { abi } from "@/abis/abi";
import { shuffleArray } from "@/utils/random";
import { getPublicClient } from "@/client-singleton";
import { getIsInCooldown } from "@/utils/routes/cooldown";

const publicClient = getPublicClient();

async function validateCommitments(
  parsedCommitments: {
    commitmentHash: string;
    tokenId: number;
    betSize: bigint;
    betToken: string;
    agent: string;
  }[]
) {
  return await Promise.all(
    parsedCommitments.filter(async (commitment) => {
      try {
        const isValid = await publicClient.readContract({
          abi,
          address: hamsterRaceV1,
          functionName: "isValidCommitment",
          args: [
            commitment.agent as Address,
            commitment.betToken as Address,
            BigInt(commitment.tokenId),
            commitment.betSize,
            commitment.commitmentHash as Address,
          ],
        });

        const isInCooldown = await getIsInCooldown(commitment.tokenId);

        return isValid && !isInCooldown;
      } catch (error) {
        // console.log(error);
      }
    })
  );
}

const schema = z
  .object({
    commitmentHash: z.string(),
    tokenId: z.number(),
    betSize: z.coerce.bigint(),
    betToken: z.string(),
    agent: z.string(),
  })
  .array();

const now = new Date(new Date().toString().slice(0, -3));

async function getAddressCommitment(address: string) {
  const addrCommitments = await db.query.commitments.findMany({
    where: and(
      eq(commitments.player, address),
      eq(commitments.betToken, betToken),
      gt(commitments.deadline, now),
      lt(commitments.usedCount, commitments.count)
    ),
    columns: {
      commitmentHash: true,
      tokenId: true,
      betSize: true,
      betToken: true,
      agent: true,
    },
    limit: 30,
  });

  const parsedCommitments = schema.parse(addrCommitments);

  const validCommitments = await validateCommitments(parsedCommitments);

  if (validCommitments.length === 0)
    throw new Error("you don't have any valid commitments");

  const random = shuffleArray(validCommitments);

  return random[0];
}

async function getValidCommitments(address: Address) {
  const validCommitment = await getAddressCommitment(address);

  let validCommitments = [validCommitment];

  let raceCommitments = await db.query.commitments.findMany({
    where: and(
      ne(commitments.tokenId, validCommitment.tokenId),
      eq(commitments.betToken, validCommitment.betToken),
      eq(commitments.betSize, validCommitment.betSize.toString()),
      gt(commitments.deadline, now),
      lt(commitments.usedCount, commitments.count)
    ),
    columns: {
      commitmentHash: true,
      tokenId: true,
      betSize: true,
      betToken: true,
      agent: true,
    },
    limit: 30,
    orderBy: [desc(commitments.deadline)],
  });

  const parsedRaceCommitments = schema.parse(raceCommitments);

  const opponentCommitments = await validateCommitments(parsedRaceCommitments);

  if (opponentCommitments.length === 0)
    throw new Error("there are no valid commitments to race against");

  const random = shuffleArray(opponentCommitments);

  validCommitments.push(random[0]);

  return validCommitments;
}

export { getValidCommitments };
