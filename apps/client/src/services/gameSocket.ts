// src/services/gameSocketService.ts
import { useEffect } from 'react'
import { socketService } from './socket'
import { INITIAL_STATE, } from '@/stores/gameStore'
import { useGameActions, useGameContext } from '@/contexts/GameContext';

export function initializeGameSocket(gameId: number, userId: number) {
  const actions = useGameActions();
  const { store } = useGameContext();

  useEffect(() => {
    const unsubscribe = socketService.listenGameEvents(actions.handleSocketEvent)

    socketService.joinGameRoom({
      gameId,
      userId,
    })

    return () => {
      unsubscribe();
      store.setState(() => INITIAL_STATE);
      socketService.leaveGame(gameId, userId);
    };
  }, [])
}