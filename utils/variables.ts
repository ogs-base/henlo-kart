import { env } from "@/env";
import { Address } from "viem";

const hamsterRaceV1 = (
  env.NODE_ENV === "production"
    ? env.HAMSTER_RACE_V1
    : env.HAMSTER_RACE_V1_TESTNET
) as Address;

const betToken = (
  env.NODE_ENV === "production" ? env.BET_TOKEN : env.BET_TOKEN_TESTNET
) as Address;

const qLearningAgentV1 = (
  env.NODE_ENV === "production"
    ? env.Q_LEARNING_AGENT_V1
    : env.Q_LEARNING_AGENT_V1_TESTNET
) as Address;

const chainId = env.NODE_ENV === "production" ? "eip155:8453" : "eip155:84532";

const { href: menuGif } = new URL(
  `/HK_24fps_530px.gif`,
  env.IMAGE_GENERATOR_BASE_URL
);

const { href: bg } = new URL(
  `/pattern-black.jpg`,
  env.IMAGE_GENERATOR_BASE_URL
);

const { href: menuGifZoomed } = new URL(
  `/og-hamsters-zoom-530px.gif`,
  env.IMAGE_GENERATOR_BASE_URL
);

export {
  hamsterRaceV1,
  betToken,
  qLearningAgentV1,
  chainId,
  menuGif,
  bg,
  menuGifZoomed,
};
