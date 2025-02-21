import { Type } from '@sinclair/typebox';

export const HealthQuerystring = Type.Object({
  verbose: Type.Optional(Type.Boolean()),
});

export const HealthHeaders = Type.Object({
  'x-request-id': Type.Optional(Type.String()),
});

export const HealthResponse = Type.Object({
  status: Type.String(),
  timestamp: Type.String(),
  version: Type.String(),
  details: Type.Optional(Type.Object({
    uptime: Type.Number(),
    memory: Type.Object({
      heapUsed: Type.Number(),
      heapTotal: Type.Number(),
    }),
  })),
});
