import { Client } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

import * as schema from "./schema/index";
import { env } from "@/env";

export const db = drizzle(
  new Client({
    url:
      env.NODE_ENV === "production"
        ? env.DATABASE_URL
        : env.DATABASE_URL_TESTNET,
  }),
  {
    schema,
  }
);
