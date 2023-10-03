interface Test {
    id: number;
    name: string;
}
declare class DatabaseController {
    private connectionId;
    constructor(id: number);
    expose(): void;
}
export { DatabaseController, Test };
