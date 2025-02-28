import type { z } from 'zod';

export type InboundSocketEventDefinition<
  T extends z.ZodObject<any, any, any, any, any> = z.ZodObject<any, any, any, any, any>,
> = {
  handler: (socketId: string, payload: z.infer<T>) => void,
  schema: T;
};
