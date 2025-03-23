import { Type } from '@sinclair/typebox';

export const CreateUserReqBody = Type.Object({
  username: Type.String({ minLength: 3, maxLength: 50 }),
  email: Type.String({ format: 'email' }),
  phone: Type.Optional(Type.String()),
  password: Type.String({ minLength: 5 }),
});

export const UpdateUserReqBody = Type.Partial(CreateUserReqBody);

export const UserParams = Type.Object({
  id: Type.String({ pattern: '^[0-9]+$' }),
});

export const UserRole = Type.Union([
  Type.Literal('BASIC'),
  Type.Literal('ADMIN'),
]);

export const UserResponse = Type.Object({
  id: Type.Number(),
  username: Type.String(),
  email: Type.String(),
  phone: Type.Union([Type.String(), Type.Null()]),
  role: UserRole,
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
});

export type CreateUserSchema = typeof CreateUserReqBody.static;
export type UpdateUserSchema = Partial<CreateUserSchema>;
