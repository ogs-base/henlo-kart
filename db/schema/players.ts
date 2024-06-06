import { commitments } from "@/db/schema/commitments";
import { relations } from "drizzle-orm";
import {
  mysqlTable,
  serial,
  bigint,
  index,
  char,
  varchar,
  boolean,
  smallint,
  int,
  datetime,
} from "drizzle-orm/mysql-core";

const players = mysqlTable(
  "players",
  {
    id: serial("id").primaryKey(),
    racesWon: bigint("racesWon", { mode: "bigint", unsigned: true }),
    racesLost: bigint("racesLost", { mode: "bigint", unsigned: true }),
    betsLost: varchar("betsLost", { length: 256 }),
    betsWon: varchar("betsWon", { length: 256 }),
    lastRaceBet: varchar("lastRaceBet", { length: 256 }),
    lastRaceResult: boolean("lastRaceResult"),
    level: smallint("level", { unsigned: true }),
    xp: int("xp", { unsigned: true }),
    address: char("address", { length: 42 }).unique(),
    masteryTime: datetime("masteryTime", { fsp: 3, mode: "date" }),
  },
  ({ address }) => ({
    addressIdx: index("address_idx").on(address),
  })
);

const playersRelations = relations(players, ({ many }) => ({
  commitments: many(commitments),
}));

export { players, playersRelations };
