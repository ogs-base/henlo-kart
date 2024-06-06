/** @jsxImportSource frog/jsx */
import "dotenv/config";
import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";
import { handle } from "frog/vercel";
import { Address } from "viem";
import { abi } from "@/abis/abi";
import { z, ZodError } from "zod";
import { bg, hamsterRaceV1, chainId } from "@/utils/variables";
import { getValidCommitments } from "@/utils/routes/race-address";

type State = {
  address: Address | undefined;
  validCommitments: Address[] | undefined;
};

const app = new Frog<{ State: State }>({
  assetsPath: "/",
  basePath: "/race",
  initialState: {
    address: undefined,
    validCommitments: undefined,
  },
});

app.frame("/", (c) => {
  const { deriveState } = c;

  deriveState((previousState) => {
    previousState.address = undefined;
    previousState.validCommitments = undefined;
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
        enter your base address
      </div>
    ),
    imageOptions: {
      width: 530,
      height: 275,
    },
    intents: [
      <TextInput placeholder="enter your base address" />,
      <Button action="/race">find commitments</Button>,
    ],
  });
});

app.frame("/race", async (c) => {
  const errorMessage = new Error("invalid ethereum address");

  const { deriveState, inputText } = c;
  try {
    const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;

    const address = z
      .string()
      .regex(ethereumAddressRegex)
      .parse(!!deriveState().address ? deriveState().address : inputText, {
        errorMap: () => errorMessage,
      });

    deriveState((previousState) => {
      previousState.address = address as Address;
    });

    const validCommitments = await getValidCommitments(address as Address);

    deriveState((previousState) => {
      previousState.validCommitments = validCommitments.map(
        (commitment) => commitment.commitmentHash as Address
      );
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
      imageOptions: {
        width: 530,
        height: 275,
      },
      intents: [
        <Button.Reset>go back</Button.Reset>,
        <Button action="/race">refresh</Button>,
        <Button.Transaction target="/execute-race">
          start race
        </Button.Transaction>,
      ],
    });
  } catch (error) {
    let message = "Something went wrong";
    if (error instanceof Error) message = error.message;
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

app.transaction("/execute-race", async (c) => {
  const {
    previousState: { validCommitments },
  } = c;

  if (validCommitments === undefined) throw "no valid commitments";

  return c.contract({
    abi,
    chainId,
    gas: BigInt(5_000_000),
    functionName: "executeRace",
    args: [validCommitments],
    to: hamsterRaceV1,
  });
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
