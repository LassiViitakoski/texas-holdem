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
