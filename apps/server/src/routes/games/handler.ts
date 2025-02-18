import { FastifyReply, FastifyRequest } from 'fastify';
import { DatabaseApi } from '@texas-holdem/database-api';
import { CreateGameSchema, GameParams } from './schema';

const db = DatabaseApi.getInstance();

export async function createGameHandler(
  request: FastifyRequest<{ Body: typeof CreateGameSchema }>,
  reply: FastifyReply,
) {
  const { blinds, maxPlayers /* buyIn */ } = request.body;

  const game = await db.game.create({
    blinds,
    maxPlayers,
  });

  return reply.code(201).send(game);
}

export async function getGameHandler(
  request: FastifyRequest<{ Params: typeof GameParams }>,
  reply: FastifyReply,
) {
  const { id } = request.params;

  const game = await db.game.findById(id);

  console.log({ game });

  if (!game) {
    return reply.code(404).send({ message: 'Game not found' });
  }

  return reply.send(game);
}

export const gamesHandler = {
  create: createGameHandler,
  get: getGameHandler,
};
