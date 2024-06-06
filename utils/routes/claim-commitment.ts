import { db } from "@/db";
import { commitments } from "@/db/schema";
import { betToken } from "@/utils/variables";
import { and, eq, lt } from "drizzle-orm";
import { z } from "zod";
import { Address } from "viem";

const now = new Date(new Date().toString().slice(0, -3));

const schema = z
  .object({
    commitmentHash: z.string(),
    betSize: z.coerce.bigint(),
    deadline: z.date(),
  })
  .array();

async function getCommitmentToClaim(address: string) {
  const addrCommitments = await db.query.commitments.findMany({
    where: and(
      eq(commitments.player, address),
      eq(commitments.betToken, betToken),
      lt(commitments.deadline, now),
      lt(commitments.usedCount, commitments.count)
    ),
    columns: {
      commitmentHash: true,
      deadline: true,
      betSize: true,
    },
    limit: 80,
  });

  const parsedCommitments = schema.parse(addrCommitments, {
    errorMap: () =>
      new Error("you don't have any expired commitments to claim."),
  });

  const largestBetSize = parsedCommitments.reduce(
    (acc, { betSize }) => (betSize > acc ? betSize : acc),
    BigInt(0)
  );

  const commitmentToClaim = parsedCommitments
    .filter(({ betSize }) => betSize === largestBetSize)
    .sort(({ deadline: a }, { deadline: b }) => a.getTime() - b.getTime())[0]
    .commitmentHash as Address;

  return commitmentToClaim;
}

export { getCommitmentToClaim };
