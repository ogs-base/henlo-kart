import { db } from "@/db";
import { commitmentsToRaces, commitments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

async function addCommitmentsToRace(
  commitmentsToRace: string[],
  raceId: bigint
) {
  for (const commitmentHash of commitmentsToRace) {
    const commitment = await db.query.commitments.findFirst({
      where: eq(commitments.commitmentHash, commitmentHash),
      columns: { usedCount: true },
    });

    const usedCount = z.bigint().parse(commitment?.usedCount);

    // Increment the used count of the commitment
    await db
      .update(commitments)
      .set({
        usedCount: usedCount + BigInt(1),
      })
      .where(eq(commitments.commitmentHash, commitmentHash));

    // Link commitments to the race
    await db.insert(commitmentsToRaces).values({
      commitmentHash,
      raceId,
    });
  }
}

// Get all the commitments that participated in the race
// querying by the race id
async function getCommitmentsInRace(raceId: bigint) {
  const commitmentsInRace = await db.query.commitmentsToRaces
    .findMany({
      where: eq(commitmentsToRaces.raceId, raceId),
      columns: {},
      with: {
        commitment: {
          columns: {
            player: true,
            tokenId: true,
          },
        },
      },
      limit: 2,
    })
    .then((commitment) => commitment.map(({ commitment }) => commitment));

  const commitmentsInRaceParsed = z
    .object({
      player: z.string(),
      tokenId: z.number(),
    })
    .array()
    .parse(commitmentsInRace);

  console.log({ commitmentsInRaceParsed });

  return commitmentsInRaceParsed;
}

export { getCommitmentsInRace, addCommitmentsToRace };
