import { io, Socket } from 'socket.io-client';

class SocketService {
  private static instance: SocketService;
  private socket: Socket;

  private constructor() {
    this.socket = io('http://localhost:3002');
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new SocketService();
    }
    return this.instance;
  }

  joinGameAsSpectator(payload: { gameId: number, userId: number }) {
    console.log('JOIN GAME AS SPECTATOR', payload);
    this.socket.emit('GAME_JOIN_AS_SPECTATOR', {
      gameId: payload.gameId,
      userId: payload.userId,
    });
  }

  joinGame(payload: { gameId: number, buyIn: number, userId: number, position: number }) {
    console.log('JOIN GAME', payload);
    this.socket.emit('GAME_JOIN', {
      gameId: payload.gameId,
      buyIn: payload.buyIn,
      userId: payload.userId,
      position: payload.position,
    });
  }

  leaveGame(gameId: number) {
    console.log('LEAVE GAME', gameId);
    this.socket.emit('leave-game', gameId);
  }

  placeBet(gameId: number, amount: number) {
    this.socket.emit('place-bet', { gameId, amount });
  }

  onGameUpdate(callback: (event: any) => void) {
    this.socket.on('game-update', callback);
    return () => {
      this.socket.off('game-update', callback);
    };
  }
}

export const socketService = SocketService.getInstance(); 