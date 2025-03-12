// src/core/tokenService.ts
import jwt, { SignOptions } from 'jsonwebtoken';
import type { TokenPayload } from '../types';

export const generateToken = (
  payload: Omit<TokenPayload, 'iat' | 'exp'>,
  options: SignOptions,
): string => jwt.sign(payload, process.env.JWT_SECRET!, options);

export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const generateAuthTokens = (user: { id: string, username: string, roles: string[] }) => {
  const accessToken = generateToken(
    { userId: user.id, username: user.username, roles: user.roles },
    { expiresIn: '1h' },
  );

  const refreshToken = generateToken(
    { userId: user.id, username: user.username, roles: user.roles },
    { expiresIn: '7d' },
  );

  return { accessToken, refreshToken };
};
