import { commitments } from "@/db/schema/commitments";
import { races } from "@/db/schema/races";
import { relations } from "drizzle-orm";
import {
  bigint,
  mysqlTable,
  primaryKey,
  varchar,
} from "drizzle-orm/mysql-core";

export const commitmentsToRaces = mysqlTable(
  "commitments_to_races",
  {
    commitmentHash: varchar("commitment_hash", { length: 124 }).notNull(),
    raceId: bigint("race_id", {
      mode: "bigint",
      unsigned: true,
    }).notNull(),
  },
  ({ commitmentHash, raceId }) => ({
    pk: primaryKey({ columns: [commitmentHash, raceId] }),
  })
);

export const commitmentsToRacesRelations = relations(
  commitmentsToRaces,
  ({ one }) => ({
    race: one(races, {
      fields: [commitmentsToRaces.raceId],
      references: [races.raceId],
    }),
    commitment: one(commitments, {
      fields: [commitmentsToRaces.commitmentHash],
      references: [commitments.commitmentHash],
    }),
  })
);
