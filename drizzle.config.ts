import { type Config } from "drizzle-kit";
import { env } from "@/env";

// export default {
//   schema: "./db/schema/index.ts",
//   driver: "mysql2",
//   out: "./drizzle",
//   dbCredentials: {
//     uri:
//       env.NODE_ENV === "production"
//         ? env.DATABASE_URL
//         : env.DATABASE_URL_TESTNET,
//   },
// } satisfies Config;

export default {
  dialect: "mysql",
  schema: "./db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url:
      env.NODE_ENV === "production"
        ? env.DATABASE_URL
        : env.DATABASE_URL_TESTNET,
  },
} satisfies Config;
