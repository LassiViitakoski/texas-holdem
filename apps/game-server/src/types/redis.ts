import { Game } from '@/game';

export type InboundGameEvent = 'game:created' | 'game:started' | 'game:finished';

export type OutboundGameEvent = 'round:started' | 'round:finished' | 'player:action';

export type GameEventPayload = {
  'game:created': Game;
  'game:started': { gameId: number };
  'game:finished': { gameId: number };
};

export type RedisMessage<T extends InboundGameEvent> = {
  event: T;
  payload: GameEventPayload[T];
  timestamp: number;
};
