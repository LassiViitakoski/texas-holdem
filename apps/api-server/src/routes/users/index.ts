import { FastifyInstance } from 'fastify';
import { Type } from '@sinclair/typebox';
import {
  CreateUserReqBody,
  UpdateUserReqBody,
  UserParams,
  UserResponse,
} from './schema';
import {
  getUsers,
  getUserById,
  userHandler,
} from './handler';

export const userRoutes = (fastify: FastifyInstance) => {
  fastify.get('/', {
    schema: {
      response: {
        200: Type.Array(UserResponse),
      },
    },
  }, getUsers);

  fastify.get('/:id', {
    schema: {
      params: UserParams,
      response: {
        200: UserResponse,
      },
    },
  }, getUserById);

  fastify.post('/', {
    schema: {
      body: CreateUserReqBody,
      response: {
        201: UserResponse,
      },
    },
  }, userHandler.create);

  fastify.patch('/:id', {
    schema: {
      body: UpdateUserReqBody,
      response: {
        200: UserResponse,
      },
    },
  }, userHandler.update);
};
