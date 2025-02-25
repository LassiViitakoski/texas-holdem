import Fastify, { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import corsPlugin from './plugins/cors';
import { gamesRoutes } from './routes/games';
import { userRoutes } from './routes/users';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
          colorize: true,
        },
      },
    },
  })
    .withTypeProvider<TypeBoxTypeProvider>();

  // Register plugins
  await app.register(corsPlugin);

  // Register routes
  await app.register(gamesRoutes, { prefix: '/games' });
  await app.register(userRoutes, { prefix: '/users' });

  return app;
}
