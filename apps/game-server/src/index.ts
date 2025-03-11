import 'source-map-support/register';
import { db } from '@texas-holdem/database-api';
import { gameManager } from './game';
import { messageBroker } from './services/message-broker';
import { socketManager } from './services/socket-manager';

(async () => {
  try {
    // await db.resetDb();

    messageBroker.subscribe('api-channel');
    messageBroker.listenMessages(gameManager.messageBrokerEvents);
    socketManager.initializeClientListeners(gameManager.socketEvents);

    // Initialize game manager with active games
    await db.game.clearRounds();
    await gameManager.initialize();

    // const waitingGames = gameManager.getWaitingGames();

    console.log('Game manager initialized with active games', JSON.stringify(gameManager.getAllGames()));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})()
  .catch(console.error);
