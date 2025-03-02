import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { z } from 'zod';

// Base type for event definitions
export type BaseSocketEvent = Record<string, {
  schema: z.ZodType;
  handler: (socketId: string, payload: any) => void;
}>;

export type InferSocketEvent<T extends BaseSocketEvent> = {
  [K in keyof T]: {
    schema: T[K]['schema'];
    handler: (socketId: string, payload: z.infer<T[K]['schema']>) => void;
  }
};

export class SocketManager {
  private static instance: SocketManager;

  private io: Server;

  private httpServer: ReturnType<typeof createServer>;

  private gameRoomConnections: Map<number, { userId: number; socketId: string; isSpectator: boolean }[]> = new Map();

  private constructor(port: number) {
    this.httpServer = createServer();
    this.io = new Server(this.httpServer, { cors: { origin: '*' } });
    this.httpServer.listen(port);
  }

  static getInstance(port = 3002) {
    if (!this.instance) {
      this.instance = new SocketManager(port);
    }

    return this.instance;
  }

  public initializeClientListeners<T extends BaseSocketEvent>(listeners: InferSocketEvent<T>) {
    this.io.on('connection', (socket: Socket) => {
      (Object.keys(listeners) as (keyof T)[]).forEach((event) => {
        const { handler, schema } = listeners[event];

        socket.on(event as string, (payload: unknown) => {
          console.log('Socket.IO Event', event, payload);

          const parsedSchema = schema.safeParse(payload);

          if (parsedSchema.success) {
            handler(socket.id, parsedSchema.data);
          } else {
            throw new Error(`Invalid payload: ${parsedSchema.error}`);
          }
        });
      });

      socket.on('disconnect', () => socket.removeAllListeners());
    });
  }

  public emitGameEvent(gameId: number, event: unknown) {
    const sockets = this.gameRoomConnections.get(gameId);

    if (sockets) {
      this.io.to(sockets.map((s) => s.socketId)).emit('game-update', event);
    }
  }

  public emitUserEvent(gameId: number, userId: number, event: unknown) {
    const sockets = this.gameRoomConnections.get(gameId) || [];
    const playerSocket = sockets.find((s) => s.userId === userId);

    if (playerSocket) {
      this.io.to(playerSocket.socketId).emit('game-update', event);
    }
  }

  public addUserToGameRoom(gameId: number, userId: number, socketId: string, isSpectator = false) {
    const gameRoomSockets = this.gameRoomConnections.get(gameId) || [];
    const existingSocket = gameRoomSockets.find((s) => s.userId === userId);

    if (!existingSocket) {
      this.gameRoomConnections.set(
        gameId,
        [...gameRoomSockets, { userId, socketId, isSpectator }],
      );
    } else {
      throw new Error('User is already in game room...');
    }
  }

  public removeUserFromGameRoom(gameId: number, userId: number) {
    const gameRoomSockets = this.gameRoomConnections.get(gameId) || [];
    const newGameRoomSockets = gameRoomSockets.filter((s) => s.userId !== userId);
    this.gameRoomConnections.set(gameId, newGameRoomSockets);
  }
}

export const socketManager = SocketManager.getInstance();
