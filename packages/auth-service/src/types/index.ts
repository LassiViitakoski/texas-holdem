export interface TokenPayload {
  userId: string;
  username: string;
  roles: string[];
  iat?: number; // issued at timestamp (added by JWT)
  exp?: number; // expiration timestamp (added by JWT)
}

export interface TokenOptions {
  expiresIn: string | number;
}
