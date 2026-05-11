declare module 'adaptr' {
    export default class Adaptr {
        constructor(key: string, schema: object);

        serialize(data: object, exclude?: string[]): object;
        unserialize(data: object, exclude?: string[]): object;
    }
}
