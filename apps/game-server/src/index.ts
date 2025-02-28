import { Redis } from 'ioredis';
import { db } from '@texas-holdem/database-api';
import { envConfig } from './config';
import { gameManager } from './game';
import { RedisMessage, InboundGameEvent } from './types/redis';
import { socketManager } from './services/socket-manager';

(async () => {
  const redis = new Redis(envConfig.REDIS_URL);

  socketManager.initializeClientListeners(gameManager.gameEventListeners);

  try {
    // await db.resetDb();

    // Initialize game manager with active games
    await db.game.clearRounds();
    await gameManager.initialize();

    // const waitingGames = gameManager.getWaitingGames();

    console.log('Game manager initialized with active games', JSON.stringify(gameManager.getAllGames()));

    redis.subscribe('game-events-api-server', (err, result) => {
      if (err) {
        console.error('Failed to subscribe:', err);
      }
      console.log('Subscribed to game-events-api-server', result);
    });

    redis.on('message', async (channel, message) => {
      const { event, payload } = JSON.parse(message) as RedisMessage<InboundGameEvent>;

      console.log('Message received:', message);

      if (event === 'game:created') {
        /* gameManager.addGame(
          new Game(payload as RedisMessage<'game:created'>['payload']),
        ); */

        console.log('Game added to game manager', JSON.stringify(gameManager.getAllGames()));
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})()
  .catch(console.error);
