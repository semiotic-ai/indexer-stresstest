# indexer-stresstest

This is a relatively basic random query generator that's targeted at stress-testing
The Graph's [graph node](https://github.com/graphprotocol/graph-node). It is relying
heavily on IBM's
[graphql-query-generator](https://github.com/IBM/graphql-query-generator).

What it does is use the target subgraph's GraphQL schema, as well as pull all queryable
IDs for all data types to generate the random queries. It is not capable of creating
filters other than specific IDs. The generated queries will feature repetitions,
nesting, etc.

Note that Semiotic AI does not guarantee support and maintenance of this software.
It is released for its potential usefulness to The Graph indexers. Feel free to fork and
continue development.

## Usage

To get started complete the following steps below.

### 1. Dependencies

```sh
$ npm install
```

### 2. Configuration

All the configuration is stored in `config.ts`.

### 3. Save the endpoint's schema

```sh
$ npx ts-node get_schema.ts
```

The default configuration will save the contents in `schema.graphql`.

### 4. Save the endpoint's "providermap" of field IDs

```sh
$ npx ts-node get_providermap.ts
```

The default configuration will save the contents in `providermap.json`.
Will print a list of the fields to stdout.

### 5. Run the stress-test

```sh
$ npx ts-node stresstest.ts
```

Will continuously generate random queries and print the results to `stdout`.
Kill the process to stop it.
