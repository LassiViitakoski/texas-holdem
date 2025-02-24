/**
 * Game route handlers.
 *
 * Currently, handlers directly use database-api for data access.
 * Consider introducing a service layer when:
 * 1. Business logic becomes complex (e.g., game state transitions, scoring)
 * 2. Same logic needs to be reused across different routes
 * 3. HTTP-independent operations need to be performed (e.g., WebSocket events)
 * 4. Integration with external services is required
 *
 * For now, keeping it simple with direct database access is sufficient.
 */

import { FastifyReply, FastifyRequest } from 'fastify';
import { DatabaseApi } from '@texas-holdem/database-api';
import { CreateGameReqBody, GameParams } from '@/routes/games/schema';
import { publishGameEvent } from '../../services/redis';

const db = DatabaseApi.getInstance();

export async function createGameHandler(
  request: FastifyRequest<{ Body: typeof CreateGameReqBody }>,
  reply: FastifyReply,
) {
  const { blinds, maximumPlayers /* buyIn */ } = request.body;
  const createdGame = await db.game.create({
    blinds,
    maximumPlayers,
  });
  await publishGameEvent('game:created', JSON.stringify(createdGame));
  return reply.code(201).send(createdGame);
}

export async function getGameHandler(
  request: FastifyRequest<{ Params: typeof GameParams }>,
  reply: FastifyReply,
) {
  const { id } = request.params;
  const game = await db.game.getGame(id);

  if (!game) {
    return reply.code(404).send({ message: 'Game not found' });
  }

  return reply.send(game);
}

export async function getAllGamesHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const games = await db.game.findActiveGames();
  return reply.send(games);
}

export const gamesHandler = {
  create: createGameHandler,
  get: getGameHandler,
  getAll: getAllGamesHandler,
};
