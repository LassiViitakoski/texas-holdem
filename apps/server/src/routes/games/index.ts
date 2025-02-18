import { FastifyPluginAsync } from 'fastify';
import { gamesHandler } from './handler';
import { CreateGameSchema, GameParams, GameResponse } from './schema';

export const gamesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/', {
    schema: {
      body: CreateGameSchema,
      response: {
        201: GameResponse,
      },
    },
  }, gamesHandler.create);

  fastify.get('/:id', {
    schema: {
      params: GameParams,
      response: {
        200: GameResponse,
      },
    },
  }, gamesHandler.get);
};
