export default class ContractAdapter {
    constructor(key: string, schema: object);

    fromServer(data: object, exclude?: string[]): object;
    toServer(data: object, exclude?: string[]): object;

    /**
     * @deprecated Use toServer() instead.
     */
    serialize(data: object, exclude?: string[]): object;

    /**
     * @deprecated Use fromServer() instead.
     */
    unserialize(data: object, exclude?: string[]): object;
}
