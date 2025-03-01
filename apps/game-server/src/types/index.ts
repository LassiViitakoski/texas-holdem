export type BaseEvent = Record<string, any>;

export type EventHandlerMap<T extends BaseEvent> = {
  [K in keyof T]: (payload: T[K]) => void;
};
