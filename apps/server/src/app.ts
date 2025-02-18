import Fastify, { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import corsPlugin from './plugins/cors';
import { healthRoutes } from './routes/health';
import { gamesRoutes } from './routes/games';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify()
    .withTypeProvider<TypeBoxTypeProvider>();

  // Register plugins
  await app.register(corsPlugin);

  // Register routes
  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(gamesRoutes, { prefix: '/games' });

  return app;
}
