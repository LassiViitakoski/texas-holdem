import { FastifyReply, FastifyRequest, RouteGenericInterface } from 'fastify';
import { mapDomainErrorToHttpResponse } from './http-mapper';

export const withErrorHandler = <RouteGeneric extends RouteGenericInterface>() => (
  fn: (
    request: FastifyRequest<RouteGeneric>,
    reply: FastifyReply
  ) => Promise<RouteGeneric['Reply']>,
) => async (
  request: FastifyRequest<RouteGeneric>,
  reply: FastifyReply,
): Promise<RouteGeneric['Reply']> => {
  try {
    return await fn(request, reply);
  } catch (error) {
    return mapDomainErrorToHttpResponse(error as Error, reply);
  }
};

const func = (req: FastifyRequest<{ Body: { a: number }; Querystring: unknown; Params: { b: string } }>) => {

};

/*
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
*/
