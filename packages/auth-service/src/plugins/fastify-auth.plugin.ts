import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { generateAuthTokens, verifyToken } from '../core/token-service';

interface User {
  id: string;
  username: string;
  roles: string[];
}

interface UserService {
  validateCredentials: (username: string, password: string) => Promise<User | null>;
  findById: (id: string) => Promise<User | null>;
}

interface AuthPluginOptions {
  jwtSecret: string;
  cookieSecret?: string;
  skipCookiePlugin?: boolean;
  userService: UserService;
}

const fastifyAuthPlugin: FastifyPluginAsync<AuthPluginOptions> = async (fastify, options) => {
  // Register JWT plugin
  fastify.register(fastifyJwt, {
    secret: options.jwtSecret,
    sign: {
      expiresIn: '1h', // Default for access tokens
    },
  });

  // Only register cookie plugin if not already registered and not explicitly skipped
  if (options.cookieSecret && !options.skipCookiePlugin) {
    await fastify.register(import('@fastify/cookie'), {
      secret: options.cookieSecret,
      hook: 'onRequest',
    });
  }

  // Add authentication utility to Fastify instance
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const token = await request.jwtVerify();
      const user = await options.userService.findById(token.userId);

      if (!user) {
        throw new Error('User not found');
      }

      request.user = user;
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  // Register authentication routes
  fastify.post('/auth/login', async (request, reply) => {
    const { username, password } = request.body as { username: string; password: string };

    try {
      // Validate credentials using the provided userService
      const user = await options.userService.validateCredentials(username, password);

      if (!user) {
        return await reply.code(401).send({ error: 'Invalid credentials' });
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateAuthTokens(user);

      // Set refresh token as HTTP-only cookie if cookie secret is provided
      if (options.cookieSecret) {
        reply.setCookie('refreshToken', refreshToken, {
          path: '/auth/refresh',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60, // 7 days
        });
      }

      return { accessToken, user: { id: user.id, username: user.username } };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Authentication failed' });
    }
  });

  // Refresh token endpoint
  fastify.post('/auth/refresh', async (request, reply) => {
    try {
      // Get refresh token from cookie or request body
      const refreshToken = options.cookieSecret
        ? request.cookies.refreshToken
        : (request.body as { refreshToken: string }).refreshToken;

      if (!refreshToken) {
        return await reply.code(401).send({ error: 'Refresh token required' });
      }

      // Verify refresh token
      const decoded = verifyToken(refreshToken);

      // Get user from database to ensure they still exist and have proper permissions
      const user = await options.userService.findById(decoded.userId);

      if (!user) {
        return await reply.code(401).send({ error: 'Invalid refresh token' });
      }

      // Generate new tokens
      const tokens = generateAuthTokens(user);

      // Update refresh token cookie if using cookies
      if (options.cookieSecret) {
        reply.setCookie('refreshToken', tokens.refreshToken, {
          path: '/auth/refresh',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60, // 7 days
        });
      }

      return { accessToken: tokens.accessToken };
    } catch (error) {
      request.log.error(error);
      return reply.code(401).send({ error: 'Invalid refresh token' });
    }
  });

  // Logout endpoint
  fastify.post('/auth/logout', async (request, reply) => {
    if (options.cookieSecret) {
      reply.clearCookie('refreshToken', { path: '/auth/refresh' });
    }
    return { success: true };
  });
};

export default fp(fastifyAuthPlugin, {
  name: 'auth',
  fastify: '5.x',
});
