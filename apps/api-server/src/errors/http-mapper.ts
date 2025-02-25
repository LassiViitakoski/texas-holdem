import { FastifyReply } from 'fastify';
import {
  DomainError,
  ResourceNotFoundError,
  DuplicateResourceError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  DatabaseError,
} from '@texas-holdem/database-api/src/errors/domain-errors';

interface ErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export function mapDomainErrorToHttpResponse(error: Error, reply: FastifyReply) {
  if (!(error instanceof DomainError)) {
    return reply.code(500).send({
      message: 'Internal server error',
    });
  }

  const response: ErrorResponse = {
    message: error.message,
  };

  if (error.code) {
    response.code = error.code;
  }

  if (error.details) {
    response.details = error.details;
  }

  if (error instanceof ResourceNotFoundError) {
    return reply.code(404).send(response);
  }

  if (error instanceof DuplicateResourceError) {
    return reply.code(409).send(response);
  }

  if (error instanceof ValidationError) {
    return reply.code(400).send(response);
  }

  if (error instanceof AuthenticationError) {
    return reply.code(401).send(response);
  }

  if (error instanceof AuthorizationError) {
    return reply.code(403).send(response);
  }

  if (error instanceof DatabaseError) {
    return reply.code(500).send(response);
  }

  // Default case for unhandled DomainError types
  return reply.code(500).send(response);
}
