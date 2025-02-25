export class DomainError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ResourceNotFoundError extends DomainError {
  constructor(resource: string) {
    super(`${resource} not found`);
  }
}

export class DuplicateResourceError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, undefined, details);
  }
}

export class AuthenticationError extends DomainError {
  constructor(message: string = 'Authentication failed') {
    super(message);
  }
}

export class AuthorizationError extends DomainError {
  constructor(message: string = 'Not authorized to perform this action') {
    super(message);
  }
}

export class DatabaseError extends DomainError {
  constructor(message: string = 'Database operation failed') {
    super(message);
  }
}
