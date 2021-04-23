# GraphQL stress-test

To get started complete the following steps below.

### Dependencies

```sh
$ npm install
```

### Configuration

All the configuration is stored in `config.ts`.

### Save the endpoint's schema

```sh
$ npx ts-node get_schema.ts
```

The default configuration will save the contents in `schema.graphql`.

### Save the endpoint's "providermap" of field IDs

```sh
$ npx ts-node get_providermap.ts
```

The default configuration will save the contents in `providermap.json`.
Will print a list of the fields to stdout.

### Run the stress-test

```sh
$ npx ts-node stresstest.ts
```

Will continuously generate random queries and print the results to stdout.
The only way to stop it is to kill it.
