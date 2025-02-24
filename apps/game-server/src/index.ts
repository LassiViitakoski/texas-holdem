import { Redis } from 'ioredis';
import { envConfig } from './config';
import { Game } from './game';
import { GameManager } from './game-manager';
import { RedisMessage, InboundGameEvent } from './types/redis';
import { SocketManager } from './services/socket-manager';

(async () => {
  const gameManager = GameManager.getInstance();
  const redis = new Redis(envConfig.REDIS_URL);

  try {
    // Initialize game manager with active games
    await gameManager.initialize();

    console.log('Game manager initialized with active games', JSON.stringify(gameManager.getAllGames()));

    const waitingGames = gameManager.getWaitingGames();
    const socketManager = SocketManager.getInstance();

    socketManager.emitGameEvent(1, {
      type: 'ROUND_STARTED',
      payload: {
        roundNumber: 1,
        smallBlind: 10,
        bigBlind: 20,
        dealer: 1,
      },
    });

    waitingGames.forEach((game) => {
      return;
      if (game.isReadyToStart()) {
        game.startNewRound().then((round) => {
          console.log('New round successfully started with follwing data', JSON.stringify(round, null, 2));

          // Publish messages to REST API to notify clients of new round
        });
      }
    });

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
        gameManager.addGame(
          new Game(payload as RedisMessage<'game:created'>['payload']),
        );

        console.log('Game added to game manager', JSON.stringify(gameManager.getAllGames()));
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})()
  .catch(console.error);
