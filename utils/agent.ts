import { db } from "@/db";
import { agents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

async function getAgentData(tokenId: number) {
  const agentRow = await db.query.agents.findFirst({
    where: eq(agents.tokenId, tokenId),
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
    .parse(agentRow);

  console.log(data);

  return data;
}

export { getAgentData };
