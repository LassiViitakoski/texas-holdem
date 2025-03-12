import type { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from '../core/token-service';

export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return await reply.code(401).send({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Attach user to request for use in route handlers
    request.user = decoded;
  } catch (error) {
    return reply.code(401).send({ error: 'Invalid token' });
  }
};

// Role-based authorization middleware
export const authorize = (allowedRoles: string[]) => async (request: FastifyRequest, reply: FastifyReply) => {
  if (!request.user) {
    return reply.code(401).send({ error: 'Authentication required' });
  }

  const hasRole = (request.user as any).roles.some((role) => allowedRoles.includes(role));
  if (!hasRole) {
    return reply.code(403).send({ error: 'Insufficient permissions' });
  }
};
