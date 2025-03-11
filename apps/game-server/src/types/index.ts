import type { PokerAction } from '@texas-holdem/shared-types';

export type BaseEvent = Record<string, any>;

export type EventHandlerMap<T extends BaseEvent> = {
  [K in keyof T]: (payload: T[K]) => void;
};

export type PlayerAction = {
  type: PokerAction;
  amount?: number;
};
