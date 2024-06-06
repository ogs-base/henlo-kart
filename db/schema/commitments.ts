import { agents } from "@/db/schema/agents";
import { commitmentsToRaces } from "@/db/schema/commitments-to-races";
import { players } from "@/db/schema/players";
import { relations } from "drizzle-orm";
import {
  mysqlTable,
  serial,
  index,
  bigint,
  datetime,
  char,
  smallint,
  varchar,
} from "drizzle-orm/mysql-core";

const commitments = mysqlTable(
  "commitments",
  {
    id: serial("id").primaryKey(),
    player: char("player", { length: 42 }),
    agent: char("agent", { length: 42 }),
    betToken: char("betToken", { length: 42 }),
    tokenId: smallint("tokenId", { unsigned: true }),
    betSize: varchar("betSize", { length: 256 }),
    deadline: datetime("deadline"),
    count: bigint("count", { mode: "bigint", unsigned: true }),
    usedCount: bigint("usedCount", { mode: "bigint", unsigned: true }),
    commitmentHash: varchar("commitmentHash", { length: 124 }).unique(),
  },
  ({ commitmentHash }) => ({
    commitmentHashIdx: index("commitmentHash_idx").on(commitmentHash),
  })
);

const commitmentsRelations = relations(commitments, ({ one, many }) => ({
  agent: one(agents, {
    fields: [commitments.tokenId],
    references: [agents.tokenId],
  }),
  player: one(players, {
    fields: [commitments.player],
    references: [players.address],
  }),
  commitmentsToRaces: many(commitmentsToRaces),
}));

export { commitments, commitmentsRelations };
