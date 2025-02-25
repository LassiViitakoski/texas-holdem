import { FastifyReply, FastifyRequest } from 'fastify';
import { mapDomainErrorToHttpResponse } from './http-mapper';

export const withErrorHandler = <T, B = unknown, Q = unknown, P = unknown>() => (
  fn: (
    request: FastifyRequest<{ Body: B; Querystring: Q; Params: P }>,
    reply: FastifyReply
  ) => Promise<T>,
) => async (
  request: FastifyRequest<{ Body: B; Querystring: Q; Params: P }>,
  reply: FastifyReply,
): Promise<T> => {
  try {
    return await fn(request, reply);
  } catch (error) {
    return mapDomainErrorToHttpResponse(error as Error, reply);
  }
};
