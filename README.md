# indexer-stresstest

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
