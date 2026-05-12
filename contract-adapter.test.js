import { describe, it, expect } from 'vitest';
import ContractAdapter from './src/index';

describe('input validation', () => {
    [42, null, undefined, {}, () => {}].forEach((input) => {
        it(`cannot create adaptor with key == ${input}`, () => {
            expect(() => {
                new ContractAdapter(input);
            }).toThrow();
        });
    });

    [42, null, undefined, () => {}].forEach((input) => {
        it(`cannot create adaptor with schema == ${input}`, () => {
            expect(() => {
                new ContractAdapter('test', input);
            }).toThrow();
        });
    });

    [42, null, undefined, () => {}].forEach((input) => {
        it(`cannot deserialize input that == ${input}`, () => {
            const adaptr = new ContractAdapter('test', {});
            expect(adaptr.unserialize.bind(null, input)).toThrow();
        });
    });
});

describe('serialization/unserialization', () => {
    it('can serialize/unserialize', () => {
        const data = {
            full_name: 'John Doe',
            email: 'john@example.com',
        };

        const expectedData = {
            fullName: 'John Doe',
            email: 'john@example.com',
        };

        const schema = new ContractAdapter('test', {
            full_name: 'fullName',
            email: 'email',
        });

        expect(schema.serialize(expectedData)).toEqual(data);
        expect(schema.unserialize(data)).toEqual(expectedData);
    });

    it('can serialize/userialize nested object', () => {
        const data = {
            full_name: 'John Doe',
            address: {
                city: 'New York',
                postal_code: '100001',
            },
        };

        const expectedData = {
            fullName: 'John Doe',
            address: {
                city: 'New York',
                postalCode: '100001',
            },
        };

        const addressSchema = new ContractAdapter('address', {
            city: 'city',
            postal_code: 'postalCode',
        });

        const userSchema = new ContractAdapter('user', {
            full_name: 'fullName',
            address: addressSchema,
        });

        expect(userSchema.serialize(expectedData)).toEqual(data);
        expect(userSchema.unserialize(data)).toEqual(expectedData);
    });

    it('can serialize/unserialize from "snake_case" to "cameCase" and back', () => {
        const data = {
            full_name: 'John Doe',
            email: 'john@example.com',
        };

        const expectedData = {
            fullName: 'John Doe',
            email: 'john@example.com',
        };

        const schema = new ContractAdapter('test', ['snakecase', 'camelcase']);

        expect(schema.unserialize(data)).toEqual(expectedData);
        expect(schema.serialize(expectedData)).toEqual(data);
    });

    it('can serialize/unserialize from "camelCase" to "snake_case" and back', () => {
        const data = {
            fullName: 'John Doe',
            email: 'john@example.com',
        };

        const expectedData = {
            full_name: 'John Doe',
            email: 'john@example.com',
        };

        const schema = new ContractAdapter('test', ['camelcase', 'snakecase']);

        expect(schema.unserialize(data)).toEqual(expectedData);
        expect(schema.serialize(expectedData)).toEqual(data);
    });

    it('can serialize/userialize coding style with nested object', () => {
        const data = {
            full_name: 'John Doe',
            address: {
                city: 'New York',
                postal_code: '100001',
            },
        };

        const expectedData = {
            fullName: 'John Doe',
            address: {
                city: 'New York',
                postalCode: '100001',
            },
        };

        const userSchema = new ContractAdapter('user', ['snakecase', 'camelcase']);

        expect(userSchema.serialize(expectedData)).toEqual(data);
        expect(userSchema.unserialize(data)).toEqual(expectedData);
    });

    it('can serialize/userialize coding style with nested object', () => {
        const data = {
            store_name: 'Super Store',
            products: [
                {
                    prod_name: 'Sampoo',
                    prod_price: 124,
                },
                {
                    prod_name: 'Shower Gel',
                    prod_price: 1234,
                },
            ],
        };

        const expectedData = {
            storeName: 'Super Store',
            products: [
                {
                    prodName: 'Sampoo',
                    prodPrice: 124,
                },
                {
                    prodName: 'Shower Gel',
                    prodPrice: 1234,
                },
            ],
        };

        const storeSchema = new ContractAdapter('store', ['snakecase', 'camelcase']);

        expect(storeSchema.serialize(expectedData)).toEqual(data);
        expect(storeSchema.unserialize(data)).toEqual(expectedData);
    });

    it('can serialize/deserilize from camelcase key with number "admin1"', () => {
        const data = {
            admin1: 'John Doe',
            admin22: 'Gus Doe',
        };

        const expectedData = {
            admin_1: 'John Doe',
            admin_22: 'Gus Doe',
        };

        const schema = new ContractAdapter('schema', ['camelcase', 'snakecase']);

        expect(schema.serialize(expectedData)).toEqual(data);
        expect(schema.unserialize(data)).toEqual(expectedData);
    });

    it('can serialize/deserialize even if the property of the obect is null or undefined', () => {
        const data = {
            full_name: 'John Doe',
            email: null,
        };

        const expectedData = {
            fullName: 'John Doe',
            email: null,
        };

        const schema = new ContractAdapter('schema', ['snakecase', 'camelcase']);

        expect(schema.serialize(expectedData)).toEqual(data);
        expect(schema.unserialize(data)).toEqual(expectedData);
    });

    it('can exclude keys from snakecase to camelcase conversion', () => {
        const data = {
            full_name: 'John Doe',
            raw_value: 'keep me',
        };

        const expectedData = {
            fullName: 'John Doe',
            raw_value: 'keep me',
        };

        const schema = new ContractAdapter('schema', ['snakecase', 'camelcase']);

        expect(schema.unserialize(data, ['raw_value'])).toEqual(expectedData);
        expect(schema.serialize(expectedData, ['raw_value'])).toEqual(data);
    });

    it('can exclude keys from camelcase to snakecase conversion', () => {
        const data = {
            fullName: 'John Doe',
            rawValue: 'keep me',
        };

        const expectedData = {
            full_name: 'John Doe',
            rawValue: 'keep me',
        };

        const schema = new ContractAdapter('schema', ['camelcase', 'snakecase']);

        expect(schema.unserialize(data, ['rawValue'])).toEqual(expectedData);
        expect(schema.serialize(expectedData, ['rawValue'])).toEqual(data);
    });

    it('can exclude keys from nested coding style conversion', () => {
        const data = {
            store_name: 'Super Store',
            products: [
                {
                    prod_name: 'Sampoo',
                    raw_value: 'keep me',
                    prod_meta: {
                        meta_name: 'Meta',
                        raw_child: 'keep child',
                    },
                },
            ],
        };

        const expectedData = {
            storeName: 'Super Store',
            products: [
                {
                    prodName: 'Sampoo',
                    raw_value: 'keep me',
                    prodMeta: {
                        metaName: 'Meta',
                        raw_child: 'keep child',
                    },
                },
            ],
        };

        const schema = new ContractAdapter('schema', ['snakecase', 'camelcase']);
        const exclude = ['raw_value', 'raw_child'];

        expect(schema.unserialize(data, exclude)).toEqual(expectedData);
        expect(schema.serialize(expectedData, exclude)).toEqual(data);
    });

    it('passes excluded keys to nested adapters', () => {
        const data = {
            payload: {
                full_name: 'John Doe',
                raw_value: 'keep me',
            },
        };

        const expectedData = {
            payload: {
                fullName: 'John Doe',
                raw_value: 'keep me',
            },
        };

        const payloadSchema = new ContractAdapter('payload', ['snakecase', 'camelcase']);
        const schema = new ContractAdapter('schema', {
            payload: payloadSchema,
        });

        expect(schema.unserialize(data, ['raw_value'])).toEqual(expectedData);
        expect(schema.serialize(expectedData, ['raw_value'])).toEqual(data);
    });

    describe('Preferred API (fromServer/toServer)', () => {
        it('behave exactly like unserialize/serialize', () => {
            const apiData = {
                full_name: 'John Doe',
                email: 'john@example.com',
            };

            const clientData = {
                fullName: 'John Doe',
                email: 'john@example.com',
            };

            const adapter = new ContractAdapter('test', {
                full_name: 'fullName',
                email: 'email',
            });

            // Assert that fromServer(apiData) returns the same result as the previous unserialize(apiData).
            expect(adapter.fromServer(apiData)).toEqual(adapter.unserialize(apiData));
            expect(adapter.fromServer(apiData)).toEqual(clientData);

            // Assert that toServer(clientData) returns the same result as the previous serialize(clientData).
            expect(adapter.toServer(clientData)).toEqual(adapter.serialize(clientData));
            expect(adapter.toServer(clientData)).toEqual(apiData);
        });

        it('correctly converts nested server data to client data and back', () => {
            const apiData = {
                full_name: 'John Doe',
                address: {
                    city: 'New York',
                    postal_code: '100001',
                },
            };

            const clientData = {
                fullName: 'John Doe',
                address: {
                    city: 'New York',
                    postalCode: '100001',
                },
            };

            const addressAdapter = new ContractAdapter('address', {
                city: 'city',
                postal_code: 'postalCode',
            });

            const userAdapter = new ContractAdapter('user', {
                full_name: 'fullName',
                address: addressAdapter,
            });

            // Assert that fromServer() correctly converts nested server data to client data.
            expect(userAdapter.fromServer(apiData)).toEqual(clientData);

            // Assert that toServer() correctly converts nested client data back to server data.
            expect(userAdapter.toServer(clientData)).toEqual(apiData);
        });

        it('converts keys according to automatic casing schema', () => {
            const apiData = {
                full_name: 'John Doe',
                email_address: 'john@example.com',
            };

            const clientData = {
                fullName: 'John Doe',
                emailAddress: 'john@example.com',
            };

            const adapter = new ContractAdapter('test', ['snakecase', 'camelcase']);

            // Assert that fromServer() converts snakecase keys to camelcase.
            expect(adapter.fromServer(apiData)).toEqual(clientData);

            // Assert that toServer() converts camelcase keys back to snakecase.
            expect(adapter.toServer(clientData)).toEqual(apiData);
        });
    });
});
