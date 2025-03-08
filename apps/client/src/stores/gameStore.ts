// src/stores/gameStore.ts
import { Store } from '@tanstack/react-store'
import { produce } from 'immer' // Optional but recommended for immutable updates
import { Card } from '@texas-holdem/shared-types'

// Define clear, domain-specific types
export type Player = {
  id: number
  userId: number
  name: string
  stack: number
  cards: Card[]
  position: number
  isCurrent: boolean
  hasFolded: boolean
}

export type RoundPhase = 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown'

export type BettingRound = {
  id: number
}

export type Round = {
  id: number
  phase: RoundPhase
  communityCards: Card[]
  pot: number
  dealerPosition: number

}

export type Blind = {
  id: number
  position: number
  amount: string
  createdAt: string
  updatedAt: string
}

export type TablePosition = {
  id: number
  position: number
  isActive: boolean
  isDealer: boolean
  gameId: number
  playerId: number | null
}

export interface GameState {
  id: number | null
  blinds: Blind[]
  maximumPlayers: number
  minimumPlayers: number
  chipUnit: string
  rake: string
  players: Player[]
  tablePositions: TablePosition[]
  activeRound: Round | null
}

// Initial state based on the provided object
export const INITIAL_STATE: GameState = {
  id: null,
  blinds: [],
  maximumPlayers: 4,
  minimumPlayers: 2,
  chipUnit: 'CHIP',
  rake: '0',
  players: [],
  tablePositions: [],
  activeRound: null
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
  handleSocketEvent: (store: GameStore, event: any) => {
    switch (event.type) {
      case 'PLAYER_JOINED':
        store.setState(produce(draft => {
          draft.players.push(event.payload)
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

      case 'GAME_ROOM_JOIN_SUCCESS': {
        console.log('GAME_ROOM_JOIN_SUCCESS', event.payload)
        store.setState(produce(draft => {
          draft.id = event.payload.game.id
          draft.blinds = event.payload.game.blinds
          draft.maximumPlayers = event.payload.game.maximumPlayers
          draft.minimumPlayers = event.payload.game.minimumPlayers
          draft.chipUnit = event.payload.game.chipUnit
          draft.rake = event.payload.game.rake
          draft.players = event.payload.game.players
          draft.tablePositions = event.payload.game.tablePositions
        }))
        break;
      }
    }
  },
}