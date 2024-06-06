import { commitments } from "@/db/schema/commitments";
import { races } from "@/db/schema/races";
import { relations } from "drizzle-orm";
import {
  mysqlTable,
  serial,
  bigint,
  smallint,
  index,
  varchar,
  boolean,
  int,
  datetime,
} from "drizzle-orm/mysql-core";

const agents = mysqlTable(
  "agents",
  {
    id: serial("id").primaryKey(),
    racesWon: bigint("racesWon", { mode: "bigint", unsigned: true }),
    racesLost: bigint("racesLost", { mode: "bigint", unsigned: true }),
    betsLost: varchar("betsLost", { length: 256 }),
    betsWon: varchar("betsWon", { length: 256 }),
    lastRaceBet: varchar("lastRaceBet", { length: 256 }),
    lastRaceResult: boolean("lastRaceResult"),
    lastRaceId: bigint("lastRaceId", { mode: "bigint", unsigned: true }),
    level: smallint("level", { unsigned: true }),
    xp: int("xp", { unsigned: true }),
    tokenId: smallint("tokenId", { unsigned: true }).unique(),
    masteryTime: datetime("masteryTime", { fsp: 3, mode: "date" }),
  },
  ({ tokenId }) => ({
    tokenIdIdx: index("tokenId_idx").on(tokenId),
  })
);

const agentsRelations = relations(agents, ({ one, many }) => ({
  lastRace: one(races, {
    fields: [agents.lastRaceId],
    references: [races.id],
  }),
  commitments: many(commitments),
}));

export { agents, agentsRelations };
