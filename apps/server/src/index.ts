import express, { Request, Response } from 'express';
import { DatabaseController } from 'database-api';
import { CustomEventEmitter } from './CustomEventEmitter';

export interface EmitterEvents {
    'timeout-tracker': {
        gameId: number,
        turnId: number;
        untilTimeout: number;
    };
}

(async () => {
    const app = express();
    const events = new CustomEventEmitter<EmitterEvents>();

    console.log('Terve');

    const controller = new DatabaseController(10);
    controller.expose();

    const { PORT = 3000 } = process.env;

    app.get('/', (req: Request, res: Response) => {
        events.emit('timeout-tracker', { gameId: 10, turnId: 7, untilTimeout: 10000 });
        res.send({
            message: 'Application 1 Initialized',
        });
    });

    events.on('timeout-tracker', (parameters) => {
        console.log('Timeout tracker Running with parameters', parameters);

        setTimeout(() => {
            // Make database call to figure out what is current {turnId}
            // If {turnId} same as received with parameters
            // Change turn and inform players

            console.log('Set timeout logic running');
        }, 10000);
    });

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
})();
