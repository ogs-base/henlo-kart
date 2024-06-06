import "dotenv/config";
import {
  type Address,
  createPublicClient,
  fallback,
  http,
  webSocket,
} from "viem";
import { base } from "viem/chains";
import { abi } from "@/abis/abi";
import { handlePlayerCommitted } from "@/utils/events/player-committed";
import { handleRaceFinished } from "@/utils/events/race-finished";
import { getPublicClient } from "@/client-singleton";

const publicClient = getPublicClient();

export const publicClientBase = createPublicClient({
  chain: base,
  transport: fallback([
    webSocket(process.env.WEBSOCKET_TRANSPORT),
    http(process.env.HTTP_TRANSPORT),
    http(),
  ]),
  pollingInterval: 1_000,
});

export const hamsterRaceV1 = (
  process.env.NODE_ENV === "production"
    ? process.env.HAMSTER_RACE_V1
    : process.env.HAMSTER_RACE_V1_TESTNET
) as Address;

export const ogsNft = (
  process.env.NODE_ENV === "production"
    ? process.env.OGS_NFT
    : process.env.OGS_NFT_TESTNET
) as Address;

publicClient.watchContractEvent({
  address: hamsterRaceV1,
  abi,
  eventName: "RaceFinished",
  onLogs: handleRaceFinished,
});

publicClient.watchContractEvent({
  address: hamsterRaceV1,
  abi,
  eventName: "PlayerCommitted",
  onLogs: handlePlayerCommitted,
});
