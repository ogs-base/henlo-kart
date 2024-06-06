import { abi } from "@/abis/abi";
import { getPublicClient } from "@/client-singleton";
import { db } from "@/db";
import { commitments } from "@/db/schema";
import { shuffleArray } from "@/utils/random";
import { betToken, hamsterRaceV1 } from "@/utils/variables";
import { and, desc, eq, gt, lt, ne } from "drizzle-orm";
import { Address } from "viem";
import { z } from "zod";

const publicClient = getPublicClient();

async function isReadyToRace(
  player: Address,
  betSize: string,
  tokenId: number
) {
  const now = new Date(new Date().toString().slice(0, -3));

  const playerCommitment = await db.query.commitments.findFirst({
    where: and(
      eq(commitments.tokenId, tokenId),
      eq(commitments.betToken, betToken),
      eq(commitments.player, player),
      eq(commitments.betSize, betSize.toString()),
      gt(commitments.deadline, now),
      lt(commitments.usedCount, commitments.count)
    ),
    columns: {
      commitmentHash: true,
    },
  });

  const playerHasCommitments = !!playerCommitment?.commitmentHash;
  console.log({ playerCommitment });

  let hasOps = false;
  let validCommitments: Address[] = [];

  if (playerHasCommitments) {
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

    console.log({ raceCommitments });

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
  }

  hasOps = validCommitments.length >= 1;

  const readyToRace = hasOps && playerHasCommitments;

  return {
    hasOps,
    playerHasCommitments,
    readyToRace,
  };
}

export { isReadyToRace };
