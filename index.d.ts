export default class ContractAdapter {
    constructor(key: string, schema: object);
    serialize(data: object, exclude?: string[]): object;
    unserialize(data: object, exclude?: string[]): object;
}
