import { socketService } from '../services/socket';

export function useGameSocket(gameId: number) {
  console.log('USE GAME SOCKET', gameId);

  return {
    joinGame: () => socketService.joinGame(gameId),
    leaveGame: () => socketService.leaveGame(gameId),
    placeBet: (amount: number) => socketService.placeBet(gameId, amount),
  }
} 