# Setup commands

Compile contracts:

```sh
truffle compile
```

Deploy contracts:

```sh
truffle migrate --network NETWORK_NAME
```

Run contracts tests:

```sh
truffle test

truffle test --debug
```

Start Ganache:

```sh
ganache
```

Start Ganache with database to save accounts and blockchain state:

```sh
ganache --database.dbPath ./ganache-data/
```

To start backend (hot reload)
```sh
npm run server-dev
```

To start frontend

```sh
npm run frontend
```

Type-Check, Compile and Minify for Production

```sh
npm run build
```

Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
