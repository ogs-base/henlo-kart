import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),

    // PRODUCTION
    HTTP_TRANSPORT: z.string().url(),
    WEBSOCKET_TRANSPORT: z.string().url(),

    HAMSTER_RACE_V1: z.string().min(1),
    BET_TOKEN: z.string().min(1),
    Q_LEARNING_AGENT_V1: z.string().min(1),

    // TESTNET
    HTTP_TRANSPORT_TESTNET: z.string().url(),
    WEBSOCKET_TRANSPORT_TESTNET: z.string().url(),

    HAMSTER_RACE_V1_TESTNET: z.string().min(1),
    BET_TOKEN_TESTNET: z.string().min(1),
    Q_LEARNING_AGENT_V1_TESTNET: z.string().min(1),

    TEST_USER_ADDRESS: z.string().optional(),

    IMAGE_GENERATOR_BASE_URL: z.string().url(),
    DATABASE_URL: z.string().url(),
    DATABASE_URL_TESTNET: z.string().url(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,

    // PRODUCTION
    HTTP_TRANSPORT: process.env.HTTP_TRANSPORT,
    WEBSOCKET_TRANSPORT: process.env.WEBSOCKET_TRANSPORT,

    HAMSTER_RACE_V1: process.env.HAMSTER_RACE_V1,
    BET_TOKEN: process.env.BET_TOKEN,
    Q_LEARNING_AGENT_V1: process.env.Q_LEARNING_AGENT_V1,

    // TESTNET
    HTTP_TRANSPORT_TESTNET: process.env.HTTP_TRANSPORT_TESTNET,
    WEBSOCKET_TRANSPORT_TESTNET: process.env.WEBSOCKET_TRANSPORT_TESTNET,

    HAMSTER_RACE_V1_TESTNET: process.env.HAMSTER_RACE_V1_TESTNET,
    BET_TOKEN_TESTNET: process.env.BET_TOKEN_TESTNET,
    Q_LEARNING_AGENT_V1_TESTNET: process.env.Q_LEARNING_AGENT_V1_TESTNET,

    TEST_USER_ADDRESS: process.env.TEST_USER_ADDRESS,

    IMAGE_GENERATOR_BASE_URL: process.env.IMAGE_GENERATOR_BASE_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_TESTNET: process.env.DATABASE_URL_TESTNET,
  },
});
