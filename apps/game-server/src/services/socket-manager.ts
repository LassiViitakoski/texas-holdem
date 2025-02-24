import { Server } from 'socket.io';
import { createServer } from 'http';
import { GameManager } from '../game-manager';

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
      socket.on('join-game', (gameId: number) => {
        console.log('JOIN GAME ON GAME SERVER', gameId);
        const game = GameManager.getInstance().getGame(gameId);
        if (!game) return;

        const sockets = this.gameRoomConnections.get(gameId) || new Set();
        sockets.add(socket.id);
        this.gameRoomConnections.set(gameId, sockets);

        console.log('Game Room Connections', this.gameRoomConnections);
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
