import { DatabaseController } from 'database-api';

const HANDLER_INTERVAL = 1000;

const controller = new DatabaseController(35);
controller.expose()

const timeout = (ms: number): Promise<void> => new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
});

const handler = async () => {
    const start = performance.now();

    // HANDLE BUSINESS LOGIC HERE

    const millisecondsUsed = performance.now() - start;

    if (millisecondsUsed > HANDLER_INTERVAL) {
        handler();
    } else {
        timeout(HANDLER_INTERVAL - millisecondsUsed).then(() => handler());
    }
};

(() => handler())();
