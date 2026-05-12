# contract-adapter

[![npm version](https://img.shields.io/npm/v/contract-adapter.svg)](https://www.npmjs.com/package/contract-adapter)
[![license](https://img.shields.io/npm/l/contract-adapter.svg)](LICENSE)

A tiny bidirectional DTO adapter for translating backend API contracts into frontend models and back.

Use `contract-adapter` when your backend speaks `snake_case`, your frontend speaks `camelCase`, and you want the conversion to live at the API boundary instead of being scattered through components, services, forms, and reducers.

## Why this exists

Frontend and backend code often use different naming conventions.

For example, a backend API may return this:

```json
{
  "user_id": 133,
  "is_logged_in": true
}
```

But the frontend usually wants this:

```json
{
  "userId": 133,
  "isLoggedIn": true
}
```

`contract-adapter` gives you one explicit, reversible mapping layer:

* `unserialize()` converts server/API data into client/frontend data.
* `serialize()` converts client/frontend data back into server/API data.
* Explicit schemas are supported.
* Automatic `snakecase` ↔ `camelcase` conversion is supported.
* Nested objects and arrays are supported.
* Runtime dependencies: none.

## Installation

```sh
npm install contract-adapter
```

## Quick start

```js
import ContractAdapter from 'contract-adapter';

const userFromApi = {
  id: 133,
  is_logged_in: true,
};

const userAdapter = new ContractAdapter('user', {
  id: 'userId',
  is_logged_in: 'isLoggedIn',
});

const clientUser = userAdapter.unserialize(userFromApi);

console.log(clientUser);
// {
//   userId: 133,
//   isLoggedIn: true
// }

const serverUser = userAdapter.serialize(clientUser);

console.log(serverUser);
// {
//   id: 133,
//   is_logged_in: true
// }
```

The first constructor argument, `user` in this example, identifies the adapter when it is used as a nested adapter. It does not wrap the root result.

## Explicit contract mapping

Use an object schema when you want full control over the API contract.

```js
import ContractAdapter from 'contract-adapter';

const apiUser = {
  full_name: 'John Doe',
  email: 'john@example.com',
};

const userAdapter = new ContractAdapter('user', {
  full_name: 'fullName',
  email: 'email',
});

const frontendUser = userAdapter.unserialize(apiUser);

// {
//   fullName: 'John Doe',
//   email: 'john@example.com'
// }

const payload = userAdapter.serialize(frontendUser);

// {
//   full_name: 'John Doe',
//   email: 'john@example.com'
// }
```

## Automatic casing conversion

Use an array schema when you only need convention-based conversion.

The first value is the server/input style. The second value is the client/output style.

```js
import ContractAdapter from 'contract-adapter';

const userAdapter = new ContractAdapter('user', ['snakecase', 'camelcase']);

const frontendUser = userAdapter.unserialize({
  full_name: 'John Doe',
  email: 'john@example.com',
});

// {
//   fullName: 'John Doe',
//   email: 'john@example.com'
// }

const apiPayload = userAdapter.serialize(frontendUser);

// {
//   full_name: 'John Doe',
//   email: 'john@example.com'
// }
```

The currently supported style values are:

```js
'snakecase'
'camelcase'
```

## Nested objects

Nested adapters let you model nested API contracts explicitly.

```js
import ContractAdapter from 'contract-adapter';

const addressAdapter = new ContractAdapter('address', {
  city: 'city',
  postal_code: 'postalCode',
});

const userAdapter = new ContractAdapter('user', {
  full_name: 'fullName',
  address: addressAdapter,
});

const apiUser = {
  full_name: 'John Doe',
  address: {
    city: 'New York',
    postal_code: '100001',
  },
};

const frontendUser = userAdapter.unserialize(apiUser);

// {
//   fullName: 'John Doe',
//   address: {
//     city: 'New York',
//     postalCode: '100001'
//   }
// }

const apiPayload = userAdapter.serialize(frontendUser);

// {
//   full_name: 'John Doe',
//   address: {
//     city: 'New York',
//     postal_code: '100001'
//   }
// }
```

## Nested arrays

Automatic conversion also works with arrays of nested objects.

```js
import ContractAdapter from 'contract-adapter';

const storeAdapter = new ContractAdapter('store', ['snakecase', 'camelcase']);

const frontendStore = storeAdapter.unserialize({
  store_name: 'Super Store',
  products: [
    {
      prod_name: 'Shampoo',
      prod_price: 124,
    },
    {
      prod_name: 'Shower Gel',
      prod_price: 1234,
    },
  ],
});

// {
//   storeName: 'Super Store',
//   products: [
//     {
//       prodName: 'Shampoo',
//       prodPrice: 124
//     },
//     {
//       prodName: 'Shower Gel',
//       prodPrice: 1234
//     }
//   ]
// }
```

## Excluding keys from automatic conversion

Pass an array of keys as the second argument to `unserialize()` or `serialize()` when some keys should be preserved exactly.

```js
import ContractAdapter from 'contract-adapter';

const adapter = new ContractAdapter('payload', ['snakecase', 'camelcase']);

const frontendPayload = adapter.unserialize(
  {
    full_name: 'John Doe',
    raw_value: 'keep this key unchanged',
  },
  ['raw_value']
);

// {
//   fullName: 'John Doe',
//   raw_value: 'keep this key unchanged'
// }
```

Exclusions are also passed to nested conversions.

## API

### `new ContractAdapter(key, schema)`

Creates a new adapter.

```js
const adapter = new ContractAdapter('user', schema);
```

`key` must be a string. It is used when the adapter is embedded inside another adapter.

`schema` can be either an explicit mapping object or a two-item style conversion array.

Explicit mapping schema:

```js
{
  server_key: 'clientKey'
}
```

Automatic style schema:

```js
['snakecase', 'camelcase']
['camelcase', 'snakecase']
```

### `adapter.unserialize(data, exclude?)`

Converts server/API data into client/frontend data.

```js
const clientData = adapter.unserialize(apiData);
```

### `adapter.serialize(data, exclude?)`

Converts client/frontend data into server/API data.

```js
const apiPayload = adapter.serialize(clientData);
```

### `exclude`

Optional array of keys that should not be converted during automatic style conversion.

```js
adapter.unserialize(data, ['raw_value']);
adapter.serialize(data, ['rawValue']);
```

## When to use this package

Use `contract-adapter` when:

* You want a clear boundary between API contracts and frontend models.
* You need conversion in both directions.
* You need explicit field mapping, not only automatic key casing.
* You have nested DTOs or arrays of DTOs.
* You want a small package with no runtime dependencies.

If you only need one-way key conversion, a general-purpose case-conversion package may be enough. `contract-adapter` is intended for reversible API contract adaptation.

## Migrating from `adaptr`

`contract-adapter` is the successor to `adaptr`.

Install the new package:

```sh
npm uninstall adaptr
npm install contract-adapter
```

Update imports:

```diff
- import Adaptr from 'adaptr';
+ import ContractAdapter from 'contract-adapter';
```

The core API remains the same:

```js
const adapter = new ContractAdapter('user', schema);

adapter.unserialize(apiData);
adapter.serialize(clientData);
```

## License

MIT

