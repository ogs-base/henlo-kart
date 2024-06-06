import { z } from "zod";

export const commitmentSchema = z.object({
  player: z.string(),
  agent: z.string(),
  betToken: z.string(),
  tokenId: z.bigint(),
  betSize: z.bigint(),
  deadline: z.bigint(),
  count: z.bigint(),
  commitmentHash: z.string(),
  id: z.number(),
  usedCount: z.bigint(),
});

export const commitmentEventSchema = z.object({
  commitment: z.object({
    player: z.string(),
    agent: z.string(),
    betToken: z.string(),
    tokenId: z.coerce.number(),
    betSize: z.coerce.string(),
    deadline: z.bigint().transform((val) => new Date(Number(+`${val}000`))),
    count: z.bigint(),
  }),
  commitmentHash: z.string(),
});

export const raceFinishedSchema = z.object({
  betSize: z.coerce.string(),
  betToken: z.string(),
  commitmentHashes: z.string().array(),
  executor: z.string(),
  winner: z.string(),
  raceId: z.bigint(),
  steps: z.coerce.number(),
  winningTokenId: z.coerce.number(),
});

export type CommitmentSchema = z.infer<typeof commitmentEventSchema>;
export type RaceStartedSchema = z.infer<typeof raceFinishedSchema>;
