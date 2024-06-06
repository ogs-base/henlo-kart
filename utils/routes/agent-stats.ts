import { db } from "@/db";
import { agents } from "@/db/schema";
import { schema } from "@/utils/routes/player-vs-player";
import { xpToPercent } from "@/utils/xpToPercent";
import { eq } from "drizzle-orm";
import { z } from "zod";

async function queryAgentStats(tokenId: number) {
  return await db.query.agents.findFirst({
    where: eq(agents.tokenId, tokenId),
    columns: {
      betsLost: true,
      betsWon: true,
      lastRaceBet: true,
      lastRaceResult: true,
      level: true,
      racesLost: true,
      racesWon: true,
      tokenId: true,
      xp: true,
    },
  });
}

async function getAgentStats(tokenId: number) {
  const data = await queryAgentStats(tokenId);
  const agent = schema
    .extend({
      tokenId: z.number(),
    })
    .parse(data);

  const totalRaces = `${BigInt(agent.racesLost) + BigInt(agent.racesWon)}`;
  const totalWon = `${BigInt(agent.betsWon) - BigInt(agent.betsLost)}`;

  const percentage = xpToPercent(agent.xp, agent.level, "agent");

  return {
    ...agent,
    totalRaces,
    totalWon,
    percentage,
  };
}

export { getAgentStats, queryAgentStats };
