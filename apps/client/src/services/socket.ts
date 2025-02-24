import { io, Socket } from 'socket.io-client';

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;

  private constructor() {
    this.socket = io('http://localhost:3002');
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new SocketService();
    }
    return this.instance;
  }

  joinGame(gameId: number) {
    console.log('JOIN GAME', gameId);
    this.socket?.emit('join-game', gameId);
  }

  leaveGame(gameId: number) {
    console.log('LEAVE GAME', gameId);
    this.socket?.emit('leave-game', gameId);
  }

  placeBet(gameId: number, amount: number) {
    this.socket?.emit('place-bet', { gameId, amount });
  }

  onGameUpdate(callback: (event: any) => void) {
    this.socket?.on('game-update', callback);
    return () => this.socket?.off('game-update', callback);
  }
}

export const socketService = SocketService.getInstance(); 