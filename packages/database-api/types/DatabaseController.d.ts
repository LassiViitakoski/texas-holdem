export declare class DatabaseController {
    private connectionId;
    private static connection;
    static createConnection(): void;
    constructor(id: number);
    expose(): void;
}
declare abstract class DatabaseModel {
    protected static connection: string;
    constructor();
}
export declare class ProductRepo extends DatabaseModel {
    constructor();
}
export declare class CardRepo extends DatabaseModel {
    constructor();
}
export {};
