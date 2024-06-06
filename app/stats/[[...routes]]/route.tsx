/** @jsxImportSource frog/jsx */
import "dotenv/config";
import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";
import { handle } from "frog/vercel";
import { env } from "@/env";
import { getPlayerStatsData } from "@/utils/routes/player-stats";
import { bg } from "@/utils/variables";
import { getIsInCooldown } from "@/utils/routes/cooldown";
import { getAgentStats } from "@/utils/routes/agent-stats";
import { flatten } from "flat";
import { z } from "zod";
import { Address } from "viem";
import { ogsNft, publicClientBase } from "@/event-listener";
import { ogsNftAbi } from "@/abis/ogs-nft-abi";

type State = {
  agent: number | undefined;
  player: Address | undefined;
};

const app = new Frog<{ State: State }>({
  assetsPath: "/",
  basePath: "/stats",
  initialState: {
    agent: undefined,
    player: undefined,
  },
});

app.frame("/", (c) => {
  const { deriveState } = c;

  deriveState((previousState) => {
    previousState.agent = undefined;
    previousState.player = undefined;
  });

  return c.res({
    image: (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 20,
          fontWeight: 600,
          fontFamily: "Balsamiq Sans",
        }}
      >
        <img
          src={bg}
          alt="gaias background"
          width={530}
          height={275}
          style={{
            position: "absolute",
          }}
        />
        enter token id (or enter address to view player card)
      </div>
    ),
    imageOptions: {
      width: 530,
      height: 275,
    },
    intents: [
      <TextInput placeholder="enter token id or address" />,
      <Button action="/stats">see stats</Button>,
    ],
  });
});

app.frame("/stats", async (c) => {
  const errorMessage =
    "The token ID must be a number between 0 and 499. Or enter a valid ethereum address.";
  const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  try {
    const { inputText, deriveState } = c;

    const { player, agent } = deriveState();

    if (inputText === "") throw errorMessage;

    const tokenId = z.coerce
      .number()
      .int()
      .min(0)
      .max(499)
      .safeParse(typeof agent === "number" ? `${agent}` : inputText, {
        errorMap: () => ({ message: errorMessage }),
      });

    const address = z
      .string()
      .regex(ethereumAddressRegex)
      .safeParse(typeof player === "string" ? player : inputText, {
        errorMap: () => ({ message: "Invalid Ethereum address." }),
      });

    if (!tokenId.success && !address.success) throw errorMessage;

    if (address.success) {
      deriveState((previousState) => {
        previousState.player = address.data as Address;
      });

      const playerData = await getPlayerStatsData(address.data as Address);

      const flatData = flatten(playerData);

      const url = new URL(`/player-stats`, env.IMAGE_GENERATOR_BASE_URL);

      Object.entries(flatData as Object).forEach(([key, value]) => {
        url.searchParams.append(key, `${value}`);
      });

      console.log(url.href);

      return c.res({
        image: (
          <img
            src={url.href}
            alt="player stats"
            width={530}
            height={275}
            style={{
              position: "absolute",
            }}
          />
        ),
        imageOptions: {
          width: 530,
          height: 275,
        },
        intents: [
          <Button.Reset>go back</Button.Reset>,
          <Button action="/stats">refresh</Button>,
        ],
      });
    }

    if (!tokenId.success) throw errorMessage;

    deriveState((previousState) => {
      previousState.agent = tokenId.data;
    });

    const agentData = await getAgentStats(tokenId.data);

    const agentOwner = await publicClientBase.readContract({
      abi: ogsNftAbi,
      address: ogsNft,
      functionName: "ownerOf",
      args: [BigInt(tokenId.data)],
    });

    const playerData = await getPlayerStatsData(agentOwner);

    const isInCooldown = await getIsInCooldown(tokenId.data);

    const flatData = flatten({
      player: playerData,
      agent: agentData,
      isInCooldown,
    });

    const url = new URL(`/agent-and-owner`, env.IMAGE_GENERATOR_BASE_URL);

    Object.entries(flatData as Object).forEach(([key, value]) => {
      url.searchParams.append(key, `${value}`);
    });

    console.log(url.href);

    return c.res({
      image: (
        <img
          src={url.href}
          alt="agent and owner"
          width={530}
          height={530}
          style={{
            position: "absolute",
          }}
        />
      ),
      imageAspectRatio: "1:1",
      imageOptions: {
        width: 530,
        height: 530,
      },
      intents: [
        <Button.Reset>go back</Button.Reset>,
        <Button action="/stats">refresh</Button>,
      ],
    });
  } catch (error) {
    console.log(error);
    return c.res({
      imageOptions: {
        width: 530,
        height: 275,
      },
      image: (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 20,
            fontWeight: 600,
          }}
        >
          <img
            src={bg}
            alt="gaias background"
            width={530}
            height={275}
            style={{
              position: "absolute",
            }}
          />
          something went wrong
        </div>
      ),
      intents: [<Button.Reset>go back</Button.Reset>],
    });
  }
});

// https://warpcast.com/~/add-cast-action?url=https://henlo.gaias.xyz/stats/cast-action
// app.castAction("/cast-action", async (c) => c.frame({ path: "/" }), {
//   icon: "star",
//   name: "stats",
// });

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
