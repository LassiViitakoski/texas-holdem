import { socketService } from '../services/socket';
import { useLocalStorageUser } from './useUsers';

export function useGameSocket(gameId: number) {
  const user = useLocalStorageUser();

  return {
    joinGame: (position: number) => socketService.joinGame({ gameId, buyIn: 100, userId: user.id, position }),
    leaveGame: () => socketService.leaveGame(gameId),
    placeBet: (amount: number) => socketService.placeBet(gameId, amount),
    onGameUpdate: (callback: (event: any) => void) => socketService.onGameUpdate(callback),
  }
} 