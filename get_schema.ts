/*
Copyright 2021 Semiotic AI, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

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
