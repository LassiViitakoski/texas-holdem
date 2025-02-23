import { Server } from 'socket.io';
import { Redis } from 'ioredis';
import { envConfig } from '../config';

export class SocketManager {
  private static instance: SocketManager;

  private io: Server;

  private subscriber: Redis;

  private gameToSockets: Map<number, Set<string>> = new Map();

  private constructor(server: any) {
    this.io = new Server(server, {
      cors: { origin: '*' },
    });
    this.subscriber = new Redis(envConfig.REDIS_URL);
    this.initialize();
  }

  private initialize() {
    // Handle socket connections
    this.io.on('connection', (socket) => {
      socket.on('join-game', (gameId: number) => {
        const sockets = this.gameToSockets.get(gameId) || new Set();
        sockets.add(socket.id);
        this.gameToSockets.set(gameId, sockets);
      });
    });

    // Subscribe to Redis events
    this.subscriber.subscribe('game-events');
    this.subscriber.on('message', (_, message) => {
      const { gameId, event } = JSON.parse(message);
      const sockets = this.gameToSockets.get(gameId);
      if (sockets) {
        this.io.to(Array.from(sockets)).emit('game-update', event);
      }
    });
  }

  static initialize(server: any) {
    if (!this.instance) {
      this.instance = new SocketManager(server);
    }
    return this.instance;
  }

  // Socket.IO
  ioToGame(gameId: number, event: any) {
    this.io.to(`game-${gameId}`).emit('player-action', event);
  }

  // Raw WebSocket
  // You'd need to implement room management yourself
  connectionsToGame(gameId: number, event: any) {
    const sockets = this.gameToSockets.get(gameId);
    if (sockets) {
      const connections = Array.from(sockets);
      connections.forEach((socketId) => {
        const socket = this.io.sockets.sockets[socketId];
        if (socket) {
          socket.send(JSON.stringify({ type: 'player-action', data: event }));
        }
      });
    }
  }
}
