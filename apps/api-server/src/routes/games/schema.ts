import { Type } from '@sinclair/typebox';

export const CreateGameReqBody = Type.Object({
  maximumPlayers: Type.Number({ minimum: 2, maximum: 9 }),
  blinds: Type.Array(Type.Number({ minimum: 1 }), { minItems: 2 }),
  buyIn: Type.Number({ minimum: 1 }),
});

export const GameParams = Type.Object({
  id: Type.Number(),
});

export const ChipUnit = Type.Union([
  Type.Literal('CHIP'),
  Type.Literal('CASH'),
]);

export const GameStatus = Type.Union([
  Type.Literal('WAITING'),
  Type.Literal('ROUND_IN_PROGRESS'),
  Type.Literal('INACTIVE'),
]);

// This ensures our runtime validation matches Prisma's types
export const GameResponse = Type.Object({
  id: Type.Number(),
  minimumPlayers: Type.Number(),
  maximumPlayers: Type.Number(),
  chipUnit: ChipUnit,
  rake: Type.Number(),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
  blinds: Type.Array(Type.Object({
    id: Type.Number(),
    position: Type.Number(),
    amount: Type.Number(),
  })),
});
