import { Server } from 'socket.io';
import { createServer } from 'http';
import { db } from '@texas-holdem/database-api';
import { gm } from '../game-manager';

export class SocketManager {
  private static instance: SocketManager;

  private io: Server;

  private httpServer: ReturnType<typeof createServer>;

  private gameRoomConnections: Map<number, Set<string>> = new Map();

  private constructor(port: number) {
    this.httpServer = createServer();
    this.io = new Server(this.httpServer, { cors: { origin: '*' } });
    this.initialize();
    this.httpServer.listen(port);
  }

  static getInstance(port = 3002) {
    if (!this.instance) {
      this.instance = new SocketManager(port);
    }
    return this.instance;
  }

  private initialize() {
    this.io.on('connection', (socket) => {
      socket.on('join-game', async (data: { gameId: number, buyIn: number, userId: number }) => {
        console.log('JOIN GAME ON GAME SERVER', data);
        const game = gm.getGame(data.gameId);
        if (!game) return;

        try {
          // Create new player
          const player = await db.player.create({
            gameId: data.gameId,
            stack: data.buyIn,
            userId: data.userId,
          });

          // Add socket to game room
          const sockets = this.gameRoomConnections.get(data.gameId) || new Set();
          sockets.add(socket.id);
          this.gameRoomConnections.set(data.gameId, sockets);

          // Notify all players about new player
          this.emitGameEvent(data.gameId, {
            type: 'PLAYER_JOINED',
            payload: {
              playerId: player.id,
              name: player.user.username,
              stack: player.stack,
            },
          });

          if (player.game.players.length >= player.game.minimumPlayers) {
            this.emitGameEvent(data.gameId, {
              type: 'ROUND_STARTS_SOON',
            });
          }
        } catch (error) {
          console.error('Failed to create player:', error);
          socket.emit('error', 'Failed to join game');
        }
      });

      socket.on('leave-game', (gameId: number) => {
        console.log('LEAVE GAME ON GAME SERVER', gameId);
        const sockets = this.gameRoomConnections.get(gameId);
        if (sockets) {
          sockets.delete(socket.id);
        }
      });

      socket.on('place-bet', (gameId: number, amount: number) => {
        console.log('PLACE BET ON GAME SERVER', gameId, amount);
      });
    });
  }

  public emitGameEvent(gameId: number, event: unknown) {
    const sockets = this.gameRoomConnections.get(gameId);
    if (sockets) {
      this.io.to(Array.from(sockets)).emit('game-update', event);
    }
  }
}
