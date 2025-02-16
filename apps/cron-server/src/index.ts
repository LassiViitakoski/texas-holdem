import { ToadScheduler, SimpleIntervalJob, AsyncTask } from 'toad-scheduler';
import { DatabaseApi } from '@texas-holdem/database-api';

const scheduler = new ToadScheduler();
const databaseApi = new DatabaseApi('TEST_PARAM');

// Create an async task for checking game states
const checkGameStatesTask = new AsyncTask(
  'check-game-states',
  async () => {
    try {
      // Use the new game repository
      const activeGames = await databaseApi.game.findActiveGames();

      // 2. Check each game for timeouts
      for (const game of activeGames) {
        const currentRound = game.rounds[0]; // Get the latest active round
        if (!currentRound) continue;

        const currentStage = currentRound.stages[0]; // Get the latest stage
        if (!currentStage) continue;

        // Check if any player has exceeded their turn time limit
        // This is where you'll implement your timeout logic
        // If timeout occurs, make API call to main server to handle the state change
      }
    } catch (error) {
      console.error('Error in game state check task:', error);
    }
  },
  (err: Error) => {
    console.error('Failed to check game states:', err);
  },
);

// Create a job that runs every second
const job = new SimpleIntervalJob(
  { seconds: 1, runImmediately: true },
  checkGameStatesTask,
  {
    preventOverrun: true,
  },
);

// Add the job to the scheduler
scheduler.addSimpleIntervalJob(job);

// Handle application shutdown
process.on('SIGINT', () => {
  scheduler.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  scheduler.stop();
  process.exit(0);
});
