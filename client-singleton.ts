import "dotenv/config";
import { createPublicClient, fallback, http, webSocket } from "viem";
import { base, baseSepolia } from "viem/chains";

let publicClient: ReturnType<typeof createPublicClient> | null = null;

function getPublicClient() {
  if (!publicClient) {
    return createPublicClient({
      chain: process.env.NODE_ENV === "production" ? base : baseSepolia,
      transport: fallback([
        webSocket(
          process.env.NODE_ENV === "production"
            ? process.env.WEBSOCKET_TRANSPORT
            : process.env.WEBSOCKET_TRANSPORT_TESTNET
        ),
        http(
          process.env.NODE_ENV === "production"
            ? process.env.HTTP_TRANSPORT
            : process.env.HTTP_TRANSPORT_TESTNET
        ),
        http(),
      ]),
      pollingInterval: 1_000,
    });
  }
  return publicClient;
}

export { getPublicClient };
