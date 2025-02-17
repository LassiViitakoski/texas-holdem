import { FastifyPluginAsync } from 'fastify';
import { healthHandler } from './handler';
import { HealthHeaders, HealthQuerystring, HealthResponse } from './schema';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', {
    schema: {
      querystring: HealthQuerystring,
      headers: HealthHeaders,
      response: {
        200: HealthResponse,
      },
    },
  }, healthHandler);
};
