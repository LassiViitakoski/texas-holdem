import { FastifyReply, FastifyRequest } from 'fastify';

export async function healthHandler(
  _request: FastifyRequest,
  _reply: FastifyReply,
) {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  };
}
