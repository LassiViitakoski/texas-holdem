// src/services/gameSocketService.ts
import { useEffect } from 'react'
import { socketService } from './socket'
import { GameStore, INITIAL_STATE, gameActions } from '@/stores/gameStore'
import { produce } from 'immer'

export function initializeGameSocket(gameId: number, userId: number, store: GameStore) {
  useEffect(() => {
    const unsubscribe = socketService.listenGameEvents((event) => {
      gameActions.handleSocketEvent(store, event)
    })

    socketService.joinGameRoom({
      gameId,
      userId,
    })

    return () => {
      unsubscribe();
      store.setState(produce(draft => {
        draft = INITIAL_STATE;
      }));
      socketService.leaveGame(gameId, userId);
    };
  }, [])
}

// Additional game-specific socket methods
export const gameSocketActions = {
  joinAsPlayer: (gameId: number, userId: number, buyIn: number, position: number) => {
    socketService.joinGame({
      gameId,
      userId,
      buyIn,
      position,
    })
  },

  placeBet: (gameId: number, amount: number) => {
    socketService.placeBet(gameId, amount)
  },

  // Other socket actions...
}