import { PlayerAction, PlayerActionTuple } from '@texas-holdem/shared-types';
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

  joinGameRoom(payload: { gameId: number, userId: number }) {
    console.log('JOIN GAME ROOM', payload);
    this.socket.emit('GAME_ROOM_JOIN', {
      gameId: payload.gameId,
      userId: payload.userId,
    });
  }

  joinGame(payload: { gameId: number, buyIn: number, userId: number, positionId: number }) {
    console.log('JOIN GAME', payload);
    this.socket.emit('GAME_JOIN', payload);
  }

  leaveGame(gameId: number, userId: number) {
    console.log('LEAVE GAME', gameId);
    this.socket.emit('GAME_LEAVE', {
      gameId,
      userId,
    });
  }

  sendAction(gameId: number, userId: number, actions: PlayerAction | PlayerActionTuple) {
    console.log('SEND ACTION', actions);
    this.socket.emit('PLAYER_ACTION', {
      gameId,
      userId,
      actions,
    });
  }

  listenGameEvents(callback: (event: any) => void) {
    if (!this.socket.hasListeners('GAME_UPDATE')) {
      this.socket.on('GAME_UPDATE', callback);

      return () => {
        this.socket.off('GAME_UPDATE', callback);
      }
    }

    return () => 0;
  }
}

export const socketService = SocketService.getInstance(); 