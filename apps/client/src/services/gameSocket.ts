// src/services/gameSocketService.ts
import { socketService } from './socket'
import { GameStore, gameActions } from '@/stores/gameStore'

export function initializeGameSocket(gameId: number, userId: number, store: GameStore) {
  // Set up event listener for game updates
  const unsubscribe = socketService.onGameUpdate((event) => {
    gameActions.updateFromSocketEvent(store, event)
  })

  // Join as spectator
  socketService.joinGameAsSpectator({
    gameId,
    userId,
  })

  // Return cleanup function
  return () => {
    unsubscribe()
    socketService.leaveGame(gameId)
  }
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