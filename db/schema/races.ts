import { commitmentsToRaces } from "@/db/schema/commitments-to-races";
import { relations } from "drizzle-orm";
import {
  mysqlTable,
  serial,
  bigint,
  char,
  varchar,
  index,
  smallint,
} from "drizzle-orm/mysql-core";

const races = mysqlTable(
  "races",
  {
    id: serial("id").primaryKey(),
    executor: char("executor", { length: 42 }),
    betToken: char("betToken", { length: 42 }),
    winner: char("winner", { length: 42 }),
    winningTokenId: smallint("winningTokenId", { unsigned: true }),
    betSize: varchar("betSize", { length: 256 }),
    raceId: bigint("raceId", { mode: "bigint", unsigned: true }).unique(),
  },
  ({ raceId }) => ({
    raceIdIdx: index("raceId_idx").on(raceId),
  })
);

const racesRelations = relations(races, ({ many }) => ({
  commitmentsToRaces: many(commitmentsToRaces),
}));

export { races, racesRelations };
