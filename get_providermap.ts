import * as fs from "fs";

import { buildSchema } from "graphql";
import { GraphQLClient, gql } from "graphql-request";

import * as config from "./config";

import type { GraphQLFieldMap } from "graphql";

async function get_field_ids(field: string) {
  /**
   * For a specific GQL field, retrieve all IDs from the server.
   */

  const gql_client = new GraphQLClient(config.ENDPOINT, {
    headers: config.HEADERS,
  });

  var id_list = {};
  id_list[field] = [];

  // Get the first page of 100 elements
  const query = gql`
      {
        ${field} (first: 100) {
          id
        }
      }
    `;

  var data: Object = await gql_client.request(query);
  var data_ids = Object.entries(data)[0][1];
  data_ids = data_ids.map((x) => x["id"]);
  id_list[field].push(...data_ids);

  // Get the next pages
  if (data_ids.length == 100) {
    do {
      const query = gql`
        {
          ${field} (first: 100, where: {id_gt: "${
        data_ids[data_ids.length - 1]
      }"}) {
            id
          }
        }
        `;
      data = await gql_client.request(query);
      data_ids = Object.entries(data)[0][1];
      data_ids = data_ids.map((x) => x["id"]);
      id_list[field].push(...data_ids);
    } while (data_ids.length == 100);
  }

  return id_list;
}

async function get_ids(
  queryfields: GraphQLFieldMap<any, any, { [key: string]: any }>
) {
  /**
   * Gather the IDs from all eligible fields.
   */

  delete queryfields["_meta"];

  var fields = [];

  // All the fields that do not end with `id` can be queried for IDs.
  // Add-up all the `get_field_ids` promises in an array.
  for (const [key, value] of Object.entries(queryfields)) {
    var fieldname = Object.entries(value["args"]).map((x) => x[1]["name"]);

    if (!fieldname.includes("id")) {
      console.log(`${key}: ${value}`);
      fields.push(get_field_ids(key));

      for (const v of Object.entries(value["args"])) {
        console.log(`\t${v[1]["name"]}`);
      }
    }
  }

  // Asynchronously gather all the field's IDs -- faster.
  const results = Object.assign(
    {},
    ...(await Promise.all(Object.values(fields)))
  );

  return results;
}

function get_singular_field(
  queryfields: GraphQLFieldMap<any, any, { [key: string]: any }>,
  field: string
) {
  /**
   * The fields we can query with IDs have plural names.
   * This function will return the singular form that start with lowercase.
   */

  var s =
    queryfields[field]["astNode"]["type"]["type"]["type"]["type"]["name"][
      "value"
    ];

  if (typeof s !== "string") return "";
  return s.charAt(0).toLowerCase() + s.slice(1);
}

async function make_providermap(
  queryfields: GraphQLFieldMap<any, any, { [key: string]: any }>
) {
  /**
   * Create a providermap with a format suitable for "ibm-graphql-query-generator".
   * The resulting object will contain the keys in "*__FieldName__id" format, with
   * each value being an array of all the possible IDs.
   * 
   * Note that "ibm-graphql-query-generator" actually expects a single value under each
   * key.
   */

  var ids = await get_ids(queryfields);

  var providermap: { [key: string]: any } = {};

  for (const [key, value] of Object.entries(ids)) {
    var ids_key = `*__${get_singular_field(queryfields, key)}__id`;
    providermap[ids_key] = value;
  }

  return providermap;
}

async function save_providermap() {
  const schema = buildSchema(fs.readFileSync(config.SCHEMA_PATH, "utf-8"));
  const querytype = schema.getQueryType();
  const queryfields = querytype.getFields();

  const providermap = await make_providermap(queryfields);

  fs.writeFileSync(
    config.PROVIDERMAP_PATH,
    JSON.stringify(providermap, null, 2)
  );
}

save_providermap();
