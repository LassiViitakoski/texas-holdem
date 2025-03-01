import { Redis } from 'ioredis';
import { envConfig } from '../config';
import type { BaseEvent, EventHandlerMap } from '../types';

export class MessageBroker {
  private static instance: MessageBroker;

  private publisher: Redis;

  private subscriber: Redis;

  private constructor() {
    this.publisher = new Redis(envConfig.REDIS_URL);
    this.subscriber = new Redis(envConfig.REDIS_URL);
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new MessageBroker();
    }
    return this.instance;
  }

  async publish(gameId: number, event: unknown) {
    await this.publisher.publish('game-channel', JSON.stringify({
      gameId,
      event,
      timestamp: Date.now(),
    }));
  }

  async subscribe(channel: string) {
    this.subscriber.subscribe(channel, (err, result) => {
      if (err) {
        console.error('Failed to subscribe:', err);
      } else {
        console.log(`Subscribed to channel ${channel} with result: ${result}`);
      }
    });
  }

  async listenMessages<T extends BaseEvent>(handlers: EventHandlerMap<T>) {
    this.subscriber.on('message', (channel, message) => {
      if (channel === 'api-channel') {
        const { event, payload } = JSON.parse(message);

        if (event in handlers) {
          handlers[event as keyof EventHandlerMap<T>](payload);
        }
      }
    });
  }
}

export const messageBroker = MessageBroker.getInstance();
