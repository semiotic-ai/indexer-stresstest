import * as Base64 from "base-64";

// GraphQL query endpoint URL
export const ENDPOINT =
  "https://query.example.com/subgraphs/id/QmRhYzT8HEZ9LziQhP6JfNfd4co9A7muUYQhPMJsMUojSF";

// Query headers.
// In this example we're using HTTP basic auth. Replace as needed.
export const HEADERS = {
  "Content-Type": "application/json",
  Authorization:
    "Basic " +
    Base64.encode(
      "user:password"
    ),
};

// Path to save/load the endpoint's GraphQL schema.
export const SCHEMA_PATH = "schema.graphql";

// Path to load/save the "providermap" containing the IDs of all the fields queriable
// from the endpoint.
export const PROVIDERMAP_PATH = "providermap.json";
