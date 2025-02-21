import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL as string);

export const publishGameEvent = async (event: string, payload: unknown) => {
  console.info('Publishing game event', { event, payload });
  await redis.publish('game-events', JSON.stringify({
    event,
    payload,
    timestamp: Date.now(),
  }));
};
