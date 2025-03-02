// src/stores/gameStore.ts
import { Store } from '@tanstack/react-store'
import { produce } from 'immer' // Optional but recommended for immutable updates

// Define clear, domain-specific types
export type Player = {
  id: number
  name: string
  stack: number
  cards: Card[]
  position: number
  isCurrent: boolean
  hasFolded: boolean
}

export type Card = {
  suit: 'heart' | 'diamond' | 'club' | 'spade'
  value: string
}

export type GamePhase = 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown'

export interface GameState {
  gameId: number | null
  phase: GamePhase
  players: Player[]
  communityCards: Card[]
  pot: number
  currentBet: number
  dealerPosition: number
  currentTurn: number | null
  isSpectator: boolean
}

// Initial state as a constant
const INITIAL_STATE: GameState = {
  gameId: null,
  phase: 'waiting',
  players: [],
  communityCards: [],
  pot: 0,
  currentBet: 0,
  dealerPosition: 0,
  currentTurn: null,
  isSpectator: false,
}

// Factory function to create a new store instance
// This allows creating multiple instances if needed
export function createGameStore() {
  return new Store<GameState>(INITIAL_STATE)
}

// Type for the store instance
export type GameStore = ReturnType<typeof createGameStore>

// Define action creators as pure functions
export const gameActions = {
  // Use Immer for cleaner state updates
  updateFromSocketEvent: (store: GameStore, event: any) => {
    switch (event.type) {
      case 'PLAYER_JOINED':
        store.setState(produce(state => {
          state.players.push(event.payload)
        }))
        break

      case 'CARDS_DEALT':
        store.setState(produce(state => {
          state.players = state.players.map(player =>
            player.id === event.payload.playerId
              ? { ...player, cards: event.payload.cards }
              : player
          )
        }))
        break

      case 'COMMUNITY_CARDS_UPDATED':
        store.setState(produce(state => {
          state.communityCards = event.payload.cards
          state.phase = event.payload.phase
        }))
        break

      // Other event handlers...
    }
  },

  setGameId: (store: GameStore, gameId: number) => {
    store.setState(produce(state => {
      state.gameId = gameId
    }))
  },

  setAsSpectator: (store: GameStore, isSpectator: boolean) => {
    store.setState(produce(state => {
      state.isSpectator = isSpectator
    }))
  },

  // Other actions...
}