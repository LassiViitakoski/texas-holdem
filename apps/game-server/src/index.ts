import { ToadScheduler, SimpleIntervalJob, AsyncTask } from 'toad-scheduler';
import { Redis } from 'ioredis';
import { DatabaseApi } from '@texas-holdem/database-api';
import { envConfig } from './config';

const scheduler = new ToadScheduler();
const databaseApi = DatabaseApi.getInstance();

const redis = new Redis(envConfig.REDIS_URL);

redis.subscribe('game-events', (err, result) => {
  if (err) {
    console.error('Failed to subscribe:', err);
  }

  console.log('Subscribed to game-events', result);
});

redis.on('message', async (channel, message) => {
  const { event, payload } = JSON.parse(message);

  console.log('Message received:', message);

  /* switch (event) {
    case 'game:created':
      await scheduleGameStart(payload);
      break;
    // Handle other events
  } */
});

// Create an async task for checking game states
const checkGameStatesTask = new AsyncTask(
  'check-game-states',
  async () => {
    try {
      // Use the new game repository
    } catch (error) {
      console.error('Error in game state check task:', error);
    }
  },
  (err: Error) => {
    console.error('Failed to check game states:', err);
  },
);

// Create a job that runs every second
/*
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
*/
