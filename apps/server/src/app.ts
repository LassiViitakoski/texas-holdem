import Fastify, { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import corsPlugin from './plugins/cors';
import { healthRoutes } from './routes/health';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true,
  })
    .withTypeProvider<TypeBoxTypeProvider>();

  // Register plugins
  await app.register(corsPlugin);

  // Register routes
  await app.register(healthRoutes, { prefix: '/health' });

  return app;
}
