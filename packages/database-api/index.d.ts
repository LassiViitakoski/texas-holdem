declare class DatabaseController {
    private connectionId: number;

    constructor(id: number);

    public expose: () => void;
}

export { DatabaseController };
