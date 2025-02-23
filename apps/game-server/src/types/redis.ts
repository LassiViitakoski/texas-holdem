import { Game } from '@/game';

export type GameEvent = 'game:created' | 'game:started' | 'game:finished';

export type GameEventPayload = {
  'game:created': Game;
  'game:started': { gameId: number };
  'game:finished': { gameId: number };
};

export type RedisMessage<T extends GameEvent> = {
  event: T;
  payload: GameEventPayload[T];
  timestamp: number;
};
