import { Pool, PoolConfig } from 'pg';
import { DatabaseController, PGConnection } from '.';

const controller = DatabaseController.getInstance<Pool, PoolConfig>();

controller.initializeConnection(
    new PGConnection({
        host: '127.0.0.1',
        port: 5342,
    }),
);

const queryResults = controller.query('SELECT * FROM users');

console.log({ queryResults });
