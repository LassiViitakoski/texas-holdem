import { Redis } from 'ioredis';
import { envConfig } from './config';
import { Game } from './game';
import { GameManager } from './game-manager';
import { RedisMessage, GameEvent } from './types/redis';

(async () => {
  const gameManager = GameManager.getInstance();
  const redis = new Redis(envConfig.REDIS_URL);

  try {
    // Initialize game manager with active games
    await gameManager.initialize();

    console.log('Game manager initialized with active games', JSON.stringify(gameManager.getAllGames()));

    const waitingGames = gameManager.getWaitingGames();

    waitingGames.forEach((game) => {
      if (game.players.length >= game.minPlayers && game.players.length <= game.maxPlayers) {
        game.startNewRound().then(() => {
          console.log('New round successfully started');
        });
      }
    });

    redis.subscribe('game-events', (err, result) => {
      if (err) {
        console.error('Failed to subscribe:', err);
      }
      console.log('Subscribed to game-events', result);
    });

    redis.on('message', async (channel, message) => {
      const { event, payload } = JSON.parse(message) as RedisMessage<GameEvent>;

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
