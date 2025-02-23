import { Redis } from 'ioredis';
import { envConfig } from '../config';

export class EventBus {
  private static instance: EventBus;

  private publisher: Redis;

  private constructor() {
    this.publisher = new Redis(envConfig.REDIS_URL);
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new EventBus();
    }
    return this.instance;
  }

  async publish(gameId: number, event: unknown) {
    await this.publisher.publish('game-events-game-server', JSON.stringify({
      gameId,
      event,
      timestamp: Date.now(),
    }));
  }
}
