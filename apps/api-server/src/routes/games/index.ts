import { FastifyPluginAsync } from 'fastify';
import { Type } from '@sinclair/typebox';
import { gamesHandler } from './handler';
import { CreateGameReqBody, GameParams, GameResponse } from './schema';

export const gamesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Reply: typeof GameResponse[] }>('/', {
    schema: {
      response: {
        200: Type.Array(GameResponse),
      },
    },
  }, gamesHandler.getAll);

  fastify.post<{
    Body: typeof CreateGameReqBody;
    Reply: typeof GameResponse;
  }>('/', {
    preHandler: [fastify.authenticate],
    schema: {
      body: CreateGameReqBody,
      response: {
        201: GameResponse,
      },
    },
  }, gamesHandler.create);

  fastify.get<{ Params: typeof GameParams; Reply: typeof GameResponse }>('/:id', {
    schema: {
      params: GameParams,
      response: {
        200: GameResponse,
      },
    },
  }, gamesHandler.get);
};
