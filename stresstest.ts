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

import * as fs from "fs";

import { generateRandomQuery } from "ibm-graphql-query-generator";
import { buildSchema, GraphQLSchema, print } from "graphql";
import { GraphQLClient } from "graphql-request";

import * as config from "./config";

import type { DocumentNode } from "graphql";

function get_rand_query(
  schema: GraphQLSchema,
  providermap: { [key: string]: Array<string> }
): [DocumentNode, { [varName: string]: any }] {
  // Select a random entry for each key in the id_map
  var providermap_reduced: { [key: string]: string } = {};
  for (const [key, arr] of Object.entries(providermap)) {
    if (arr.length > 0) {
      let rand_arg = Math.floor(Math.random() * arr.length);
      providermap_reduced[key] = arr[rand_arg];
    }
  }

  const configuration = {
    depthProbability: 0.5,
    breadthProbability: 0.5,
    ignoreOptionalArguments: true, // In our case, only `id`
    providerMap: providermap_reduced,
    providePlaceholders: true,
  };

  var { queryDocument, variableValues, seed } = generateRandomQuery(
    schema,
    configuration
  );

  return [queryDocument, variableValues];
}

async function stresstest() {
  const schema = buildSchema(fs.readFileSync(config.SCHEMA_PATH, "utf-8"));
  const providermap = JSON.parse(
    fs.readFileSync(config.PROVIDERMAP_PATH, "utf-8")
  );

  const gql_client = new GraphQLClient(config.ENDPOINT, {
    headers: config.HEADERS,
  });

  gql_client.setHeader('Warning', 'indexer-stresstest')

  while (true) {
    const [query, vars] = get_rand_query(schema, providermap);
    const query_str = print(query);

    var data: any;
    try {
      data = await gql_client.request(query_str, vars);
    } catch (error) {
      // Ignore that error, just print it and carry-on
      if (
        error.message.match(
          /^the chain was reorganized while executing the query/
        )
      ) {
        console.log(error);
      } else {
        // Re-throw the rest
        throw error;
      }
    }
    console.log(JSON.stringify(data, undefined, 2));
  }
}

stresstest();
