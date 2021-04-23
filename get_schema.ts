import fetch from "node-fetch";
import * as fs from "fs";

import { introspectionQuery } from "graphql/utilities/introspectionQuery";
import { buildClientSchema, buildSchema, printSchema } from "graphql/utilities";

import * as config from "./config";

export async function get_schema(
  endpoint: string,
  headers: { [key: string]: string }
) {
  /**
   * Get the schema from the server.
   */
  const response = await fetch(endpoint, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({ query: introspectionQuery }),
  });

  const { data, errors } = await response.json();

  if (response.ok) {
    return printSchema(buildClientSchema(data));
  } else {
    const error = new Error(
      errors?.map((e) => e.message).join("\n") ?? "unknown"
    );
    return Promise.reject(error);
  }
}

async function save_schema() {
  const schema = await get_schema(config.ENDPOINT, config.HEADERS);
  fs.writeFileSync(config.SCHEMA_PATH, schema);
}

save_schema();
