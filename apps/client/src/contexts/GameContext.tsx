// src/contexts/GameContext.tsx
import { createContext, useContext, useRef, ReactNode } from 'react'
import { useStore } from '@tanstack/react-store'
import { createGameStore, GameStore, GameState, gameActions, GameActions } from '@/stores/gameStore'

// Context holds both the store and actions
type GameContextValue = {
  store: GameStore
  actions: typeof gameActions
}

interface GameProviderProps {
  children: ReactNode
}

// Create a type that transforms GameActions to remove the store parameter
type BoundGameActions = {
  [K in keyof GameActions]: GameActions[K] extends (store: GameStore, ...args: infer P) => infer R
  ? (...args: P) => R
  : never;
};

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: GameProviderProps) {
  // Use useRef to ensure the store instance remains stable across renders
  const storeRef = useRef<GameStore>(null)

  // Create the store instance if it doesn't exist
  if (!storeRef.current) {
    storeRef.current = createGameStore()
  }

  // Create a stable reference to the context value
  const contextValue = useRef<GameContextValue>({
    store: storeRef.current,
    actions: gameActions
  }).current

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  )
}

// Custom hook for components to access the store
export function useGameContext() {
  const context = useContext(GameContext)

  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider')
  }

  return context
}

// Convenience hook for selecting state
export function useGameState<T>(selector: (state: GameState) => T): T {
  const { store } = useGameContext()
  return useStore(store, selector)
}

// Convenience hook for accessing actions
export function useGameActions() {
  const { store, actions } = useGameContext()

  // Update the reduce function with proper typing
  return Object.keys(actions).reduce(
    (bound, key) => {
      const actionKey = key as keyof typeof actions;
      bound[actionKey] = ((...args: unknown[]) => {
        return (actions[actionKey] as any)(store, ...args);
      }) as any;
      return bound;
    },
    {} as BoundGameActions
  )
}