import { db } from "@/db";
import { commitments } from "@/db/schema";
import { commitmentEventSchema } from "@/schema";
import { createPlayerIfNotExist } from "@/utils/player";
import { Address } from "viem";

async function handlePlayerCommitted(logs: any) {
  console.log("PLAYER COMMITTED");
  try {
    const args = logs[0]?.args;
    const { commitment, commitmentHash } = commitmentEventSchema.parse(args);

    await db.insert(commitments).values({
      ...commitment,
      usedCount: BigInt(0),
      commitmentHash,
    });

    await createPlayerIfNotExist(commitment.player as Address);
  } catch (error) {
    console.error(error);
  }
}

export { handlePlayerCommitted };
