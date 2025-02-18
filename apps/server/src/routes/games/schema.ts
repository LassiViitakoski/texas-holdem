import { Type } from '@sinclair/typebox';

export const CreateGameSchema = Type.Object({
  blinds: Type.Array(Type.Number()),
  maxPlayers: Type.Number(),
  buyIn: Type.Number(),
});

export const GameParams = Type.Object({
  id: Type.Number(),
});

export const GameResponse = Type.Object({
  id: Type.Number(),
  minimumPlayers: Type.Number(),
  maximumPlayers: Type.Number(),
  chipUnit: Type.Union([
    Type.Literal('CHIP'),
    Type.Literal('CASH'),
  ]),
  rake: Type.Number(),
  status: Type.Union([
    Type.Literal('WAITING'),
    Type.Literal('ROUND_IN_PROGRESS'),
    Type.Literal('INACTIVE'),
  ]),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
});
