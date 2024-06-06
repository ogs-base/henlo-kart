/** @jsxImportSource frog/jsx */
import "dotenv/config";
import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";
import { handle } from "frog/vercel";
import { env } from "@/env";
import { Address } from "viem";
import { abi } from "@/abis/abi";
import { betTokenAbi } from "@/abis/betTokenAbi";
import { z, ZodError } from "zod";
import { neynar } from "frog/middlewares";
import {
  betToken,
  bg,
  hamsterRaceV1,
  menuGif,
  qLearningAgentV1,
  chainId,
} from "@/utils/variables";
import { isReadyToRace } from "@/utils/routes/player-stats-2";
import { getValidCommitments } from "@/utils/routes/execute-race";
import { getIsInCooldown } from "@/utils/routes/cooldown";
import { getAgentStats } from "@/utils/routes/agent-stats";
import { getAgentVsAgentStats } from "@/utils/routes/agent-vs-agent";
import { getPlayerVsPlayerStats } from "@/utils/routes/player-vs-player";
import { flatten } from "flat";
import { getPublicClient } from "@/client-singleton";

const publicClient = getPublicClient();

type State = {
  tokenId: number | undefined;
  betSize: string | undefined;
  count: number | undefined;
  player: Address | undefined;
  readyToRace: boolean;
  commitmentsToRace: Address[] | undefined;
};

const app = new Frog<{ State: State }>({
  assetsPath: "/",
  basePath: "/play",
  initialState: {
    tokenId: undefined,
    betSize: undefined,
    count: undefined,
    player: undefined,
    readyToRace: false,
    commitmentsToRace: undefined,
  },
});

app.frame("/", (c) => {
  const { deriveState } = c;

  deriveState((previousState) => {
    previousState.tokenId = undefined;
    previousState.player = undefined;
    previousState.betSize = undefined;
    previousState.count = undefined;
    previousState.readyToRace = false;
    previousState.commitmentsToRace = undefined;
  });

  return c.res({
    image: menuGif,
    imageAspectRatio: "1:1",
    imageOptions: {
      width: 530,
      height: 530,
    },
    intents: [
      <TextInput placeholder="enter token id..." />,
      <Button action="/agent-stats" value="5">
        start
      </Button>,
      <Button action="/agent-stats" value="10">
        play x10
      </Button>,
      <Button action="/agent-stats" value="25">
        play x25
      </Button>,
    ],
  });
});

app.frame("/agent-stats", async (c) => {
  const errorMessage = "The token ID must be a number between 0 and 499.";
  try {
    const { inputText, buttonValue, deriveState } = c;

    if (inputText === "") throw errorMessage;

    const tokenId = z.coerce
      .number()
      .int()
      .min(0)
      .max(499)
      .parse(inputText, { errorMap: () => ({ message: errorMessage }) });

    const countParsed = z
      .enum(["5", "10", "25"])
      .transform((val) => Number(val))
      .parse(buttonValue, {
        errorMap: () => ({
          message: "Invalid commitment count. Must be 5, 10 or 25.",
        }),
      });

    deriveState((previousState) => {
      previousState.tokenId = tokenId;
      previousState.count = countParsed;
    });

    if (tokenId === null) throw "No token ID";

    const agent = await getAgentStats(tokenId);

    const isInCooldown = await getIsInCooldown(tokenId);

    const url = new URL(`/agent-stats`, env.IMAGE_GENERATOR_BASE_URL);

    Object.entries(agent).forEach(([key, value]) => {
      url.searchParams.append(key, `${value}`);
    });

    url.searchParams.append("isInCooldown", `${isInCooldown}`);

    return c.res({
      image: (
        <img
          src={url.href}
          alt="agent stats"
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
        !isInCooldown && <TextInput placeholder="enter your base address" />,
        !isInCooldown && (
          <Button action="/approve-or-commit" value="10">
            10 DEGEN
          </Button>
        ),
        !isInCooldown && (
          <Button action="/approve-or-commit" value="75">
            75 DEGEN
          </Button>
        ),
        !isInCooldown && (
          <Button action="/approve-or-commit" value="250">
            250 DEGEN
          </Button>
        ),
        ,
      ],
    });
  } catch (error) {
    console.log(error);
    let message = "Something went wrong";
    if (error instanceof ZodError) message = error.errors[0].message;
    if (error === errorMessage) message = errorMessage;
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
          {message}
        </div>
      ),
      intents: [<Button.Reset>go back</Button.Reset>],
    });
  }
});

app.frame("/approve-or-commit", async (c) => {
  const { deriveState, buttonValue, inputText } = c;
  try {
    const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;

    const checkPlayer = !deriveState().player
      ? z
          .string()
          .regex(ethereumAddressRegex)
          .parse(inputText, {
            errorMap: () => ({
              message: "Invalid Ethereum address.",
            }),
          })
      : deriveState().player;

    const checkBetSize = !deriveState().betSize
      ? z
          .enum(["10", "75", "250"])
          .transform((val) => (BigInt(val) * BigInt(10 ** 18)).toString())
          .parse(buttonValue, {
            errorMap: () => ({
              message: "Invalid bet size. Must be 10, 75 or 250.",
            }),
          })
      : deriveState().betSize;

    const allowance = await publicClient.readContract({
      abi: betTokenAbi,
      address: betToken,
      functionName: "allowance",
      args: [checkPlayer as Address, hamsterRaceV1 as Address],
    });

    console.log({ allowance });

    deriveState((previousState) => {
      previousState.player = checkPlayer as Address;
      previousState.betSize = checkBetSize;
    });

    const { count, tokenId, betSize, player } = deriveState();

    if (betSize === undefined) throw "no bet size";
    if (tokenId === undefined) throw "no token id";
    if (count === undefined) throw "no count";
    if (player === undefined) throw "no player";

    const hasEnoughAllowance = allowance >= BigInt(betSize) * BigInt(count);

    if (!hasEnoughAllowance) {
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
            approve spending
          </div>
        ),
        imageOptions: {
          width: 530,
          height: 275,
        },
        intents: [
          <Button.Reset>go back</Button.Reset>,
          <Button action="/approve-or-commit">refresh</Button>,
          <Button.Transaction target="/approve">approve</Button.Transaction>,
          <Button.Transaction target="/approve-infinite">
            max approve
          </Button.Transaction>,
        ],
      });
    }

    const { hasOps, readyToRace } = await isReadyToRace(
      player,
      betSize,
      tokenId
    );

    deriveState((previousState) => {
      previousState.readyToRace = hasOps;
    });

    const isInCooldown = await getIsInCooldown(tokenId);

    console.log({ hasOps, readyToRace, isInCooldown });

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
          {isInCooldown ? (
            "agent in cooldown"
          ) : readyToRace ? (
            "start race"
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "0px 10px",
              }}
            >
              <div style={{ display: "flex" }}>commit to race</div>
              <div style={{ display: "flex" }}>
                - your commitments are safe onchain
              </div>
              <div style={{ display: "flex" }}>
                - other ppl can still race against them, and you will still earn
                rewards
              </div>
              <div style={{ display: "flex" }}>
                - if no one races against it, you can withdraw the DEGEN in ~24
                hours
              </div>
              <div style={{ display: "flex" }}>
                - if you win the race, the DEGEN winnings will be automatically
                sent back to your wallet
              </div>
            </div>
          )}
        </div>
      ),
      imageOptions: {
        width: 530,
        height: 275,
      },
      intents: [
        <Button.Reset>go back</Button.Reset>,
        <Button action="/approve-or-commit">refresh</Button>,
        readyToRace ? (
          <Button.Transaction target="/execute-race" action="/agent-vs-agent">
            start race
          </Button.Transaction>
        ) : (
          <Button.Transaction
            target="/commit-to-race"
            action={hasOps ? "/execute" : "/agent-vs-agent"}
          >
            commit to race
          </Button.Transaction>
        ),
      ],
    });
  } catch (error) {
    deriveState((previousState) => {
      previousState.player = undefined;
      previousState.betSize = undefined;
    });

    let message = "Something went wrong";
    if (error instanceof ZodError) message = error.errors[0].message;
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
          {message}
        </div>
      ),
      intents: [<Button.Reset>go back</Button.Reset>],
    });
  }
});

app.transaction("/approve", (c) => {
  const {
    previousState: { betSize, count },
  } = c;

  if (count === undefined) throw "no count";
  if (betSize === undefined) throw "no bet size";

  return c.contract({
    abi: betTokenAbi,
    chainId,
    functionName: "approve",
    args: [hamsterRaceV1, BigInt(betSize) * BigInt(5) * BigInt(count)],
    to: betToken,
  });
});

app.transaction("/approve-infinite", (c) => {
  return c.contract({
    abi: betTokenAbi,
    chainId,
    functionName: "approve",
    args: [
      hamsterRaceV1,
      BigInt(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      ),
    ],
    to: betToken,
  });
});

app.transaction("/commit-to-race", (c) => {
  const {
    previousState: { betSize, tokenId, count },
  } = c;

  if (betSize === undefined) throw "no bet size";
  if (tokenId === undefined) throw "no token id";
  if (count === undefined) throw "no commit count";

  // Set the time (in seconds) to 24 hours + 1 minute in the future
  const hours24 = new Date(
    new Date().getTime() + 24 * 61 * 60 * 1000
  ).getTime();

  const hours24Seconds = parseInt(hours24.toString().slice(0, -3));

  const deadline = BigInt(hours24Seconds);

  return c.contract({
    abi,
    chainId,
    functionName: "commitToRace",
    args: [
      qLearningAgentV1,
      betToken,
      BigInt(tokenId),
      BigInt(betSize),
      deadline,
      BigInt(count),
    ],
    to: hamsterRaceV1,
  });
});

app.frame("/execute", async (c) => {
  try {
    const { deriveState } = c;

    if (!deriveState().readyToRace) throw "not ready to race";

    return c.res({
      imageOptions: {
        width: 530,
        height: 275,
        embedFont: true,
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
          start race
        </div>
      ),
      intents: [
        <Button.Reset>go back</Button.Reset>,
        <Button.Transaction target="/execute-race" action="/agent-vs-agent">
          start race
        </Button.Transaction>,
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
          something went wrong.
        </div>
      ),
      intents: [<Button.Reset>go back</Button.Reset>],
    });
  }
});

app.transaction("/execute-race", async (c) => {
  const {
    previousState: { betSize, tokenId, player },
  } = c;

  if (betSize === undefined) throw "no bet size";
  if (tokenId === undefined) throw "no token id";
  if (player === undefined) throw "no count";

  const validCommitments = await getValidCommitments(player, betSize, tokenId);

  return c.contract({
    abi,
    chainId,
    gas: BigInt(5_000_000),
    functionName: "executeRace",
    args: [validCommitments],
    to: hamsterRaceV1,
  });
});

app
  .use(
    neynar({
      apiKey: "NEYNAR_FROG_FM",
      features: ["interactor", "cast"],
    })
  )
  .frame("/agent-vs-agent", async (c) => {
    try {
      const { deriveState } = c;
      const { betSize, tokenId, player } = deriveState();

      if (!player) throw "no player";
      if (betSize === undefined) throw "no bet size";
      if (tokenId === undefined) throw "no token id";

      const { hasOps, readyToRace } = await isReadyToRace(
        player,
        betSize,
        tokenId
      );

      deriveState((previousState) => {
        previousState.readyToRace = hasOps;
      });

      const data = await getAgentVsAgentStats(tokenId);

      console.log("AGENT VS AGENT STATS", data);

      if (data.length === 1) {
        const [agent] = data;

        const isInCooldown = await getIsInCooldown(tokenId);

        const url = new URL(`/agent-stats`, env.IMAGE_GENERATOR_BASE_URL);

        console.log({ agent, isInCooldown });

        Object.entries(agent).forEach(([key, value]) => {
          url.searchParams.append(key, `${value}`);
        });

        url.searchParams.append("isInCooldown", `${isInCooldown}`);

        const canRace = !isInCooldown && readyToRace;

        console.log({ url });

        return c.res({
          image: (
            <img
              src={url.href}
              alt="agent stats"
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
            <Button action="/agent-vs-agent">refresh</Button>,
            canRace && (
              <Button.Transaction
                target="/execute-race"
                action="/agent-vs-agent"
              >
                start race
              </Button.Transaction>
            ),
          ],
        });
      }

      const [first, second] = data;

      const top = first.tokenId === tokenId ? second : first;
      const bottom = first.tokenId === tokenId ? first : second;

      const isInCooldownTop = await getIsInCooldown(top.tokenId);
      const isInCooldownBottom = await getIsInCooldown(bottom.tokenId);

      const flatData = flatten({
        top,
        bottom,
        isInCooldownTop,
        isInCooldownBottom,
      });

      const url = new URL(`/agent-vs-agent`, env.IMAGE_GENERATOR_BASE_URL);

      console.log({
        top,
        bottom,
        isInCooldownTop,
        isInCooldownBottom,
        flatData,
      });

      Object.entries(flatData as Object).forEach(([key, value]) => {
        url.searchParams.append(key, `${value}`);
      });

      const isInCooldown =
        tokenId === top.tokenId ? isInCooldownTop : isInCooldownBottom;

      const canRace = !isInCooldown && readyToRace;

      return c.res({
        image: (
          <img
            src={url.href}
            alt="agent vs agent"
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
          !canRace && <Button.Reset>go back</Button.Reset>,
          <Button action="/agent-vs-agent">refresh</Button>,
          canRace && (
            <Button.Transaction target="/execute-race" action="/agent-vs-agent">
              race again
            </Button.Transaction>
          ),
          <Button action="/player-vs-player">flip cards</Button>,
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

app
  .use(
    neynar({
      apiKey: "NEYNAR_FROG_FM",
      features: ["interactor", "cast"],
    })
  )
  .frame("/player-vs-player", async (c) => {
    try {
      const { deriveState } = c;
      const { betSize, tokenId, player } = deriveState();

      if (!player) throw "no player";
      if (betSize === undefined) throw "no bet size";
      if (tokenId === undefined) throw "no token id";

      console.log("PLAYER STATS", deriveState());

      const { hasOps, readyToRace } = await isReadyToRace(
        player,
        betSize,
        tokenId
      );

      deriveState((previousState) => {
        previousState.readyToRace = hasOps;
      });

      const [first, second] = await getPlayerVsPlayerStats(tokenId);

      const top = first.address === player ? second : first;
      const bottom = first.address === player ? first : second;

      const isInCooldown = await getIsInCooldown(tokenId);

      const flatData = flatten({ top, bottom });

      const url = new URL(`/player-vs-player`, env.IMAGE_GENERATOR_BASE_URL);

      Object.entries(flatData as Object).forEach(([key, value]) => {
        url.searchParams.append(key, `${value}`);
      });

      const canRace = !isInCooldown && readyToRace;

      return c.res({
        image: (
          <img
            src={url.href}
            alt="player vs player"
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
          !canRace && <Button.Reset>go back</Button.Reset>,
          <Button action="/player-vs-player">refresh</Button>,
          canRace && (
            <Button.Transaction target="/execute-race" action="/agent-vs-agent">
              race again
            </Button.Transaction>
          ),
          <Button action="/agent-vs-agent">flip cards</Button>,
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

// https://warpcast.com/~/add-cast-action?url=https://henlo.gaias.xyz/play/cast-action
app.castAction("/cast-action", async (c) => c.frame({ path: "/" }), {
  icon: "star",
  name: "🐹 HAMSTER RACES!? 🐹",
  description: "CLICK CLICK CLICK TO TRAIN YOUR HAMSTER",
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
