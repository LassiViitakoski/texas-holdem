import { db } from '@texas-holdem/database-api';
import {
  CreateUserReqBody,
  UpdateUserReqBody,
  UserParams,
  UserResponse,
} from './schema';
import { withErrorHandler } from '../../errors';

export const getUsers = withErrorHandler<{ Reply: typeof UserResponse[] }>()(async (
  _,
  reply,
) => {
  const users = await db.user.findAll();
  return reply.code(200).send(users);
});

export const getUserById = withErrorHandler<{ Params: typeof UserParams; Reply: typeof UserResponse }>()(async (
  request,
  reply,
) => {
  const { id } = request.params;
  const user = await db.user.findById(parseInt(id, 10));
  return reply.code(200).send(user);
});

export const createUser = withErrorHandler<{ Body: typeof CreateUserReqBody; Reply: typeof UserResponse }>()(async (
  request,
  reply,
) => {
  const { username, email, phone } = request.body;

  const user = await db.user.create({
    username,
    email,
    phone,
  });

  return reply.code(201).send(user);
});

export const updateUser = withErrorHandler<{
  Params: typeof UserParams;
  Body: typeof UpdateUserReqBody;
  Reply: typeof UserResponse;
}>()(async (
  request,
  reply,
) => {
  const { id } = request.params;
  const { username, email, phone } = request.body;

  const user = await db.user.update(parseInt(id, 10), {
    username,
    email,
    phone,
  });

  return reply.code(200).send(user);
});

export const userHandler = {
  create: createUser,
  get: getUserById,
  getAll: getUsers,
  update: updateUser,
};
