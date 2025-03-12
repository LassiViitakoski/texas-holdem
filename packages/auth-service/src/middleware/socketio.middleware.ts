// src/socketio/middleware.ts
import type { Socket } from 'socket.io';
import { verifyToken } from '../core/token-service';

export const authenticateSocket = (socket: Socket, next: (err?: Error) => void) => {
  try {
    // Get token from handshake auth or query params
    const token = socket.handshake.auth.token
      || socket.handshake.query.token as string;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    // Verify token
    const user = verifyToken(token);

    // Attach user data to socket for use in event handlers
    socket.data.user = user;

    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
};
