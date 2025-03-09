// src/stores/gameStore.ts
import { Store } from '@tanstack/react-store'
import { produce } from 'immer' // Optional but recommended for immutable updates
import type { RoundPhase, Card, PokerAction } from '@texas-holdem/shared-types'

// Define clear, domain-specific types
export type RoundPlayer = {
  id: number
  userId: number
  stack: number
  roundInitialStack: number
  roundCards: Card[]
  roundPosition: number
  hasFolded: boolean
}

export type BettingRoundActions = {
  id: number
  type: PokerAction
  amount: number
  sequence: number
}

export type BettingRound = {
  id: number
  type: RoundPhase
  isFinished: boolean
  actions: BettingRoundActions[]
}

export type Round = {
  id: number
  phase: RoundPhase
  communityCards: Card[]
  pot: number
  players: RoundPlayer[]
  currentTurn: number
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
    console.log('SOCKET EVENT RECEIVED', event);

    switch (event.type) {
      case 'PLAYER_JOINED':
        store.setState(produce(draft => {
          draft.players.push(event.payload.player)
          draft.tablePositions.forEach((tablePosition) => {
            if (tablePosition.id === event.payload.tablePositionId) {
              tablePosition.playerId = event.payload.player.id;
              tablePosition.isActive = true;
            }
          })
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
        const { game } = event.payload;
        store.setState(produce(draft => {
          draft.id = game.id
          draft.blinds = game.blinds
          draft.maximumPlayers = game.maximumPlayers
          draft.minimumPlayers = game.minimumPlayers
          draft.chipUnit = game.chipUnit
          draft.rake = game.rake
          draft.players = game.players
          draft.tablePositions = game.tablePositions
        }))
        break;
      }

      case 'DEALER_ROTATED': {
        const { tablePositionDealer } = event.payload;
        store.setState(produce(draft => {
          draft.tablePositions.forEach((tablePosition, index) => {
            if (tablePosition.id === tablePositionDealer.id) {
              console.log('UPDATING TABLE POSITION')
              draft.tablePositions[index] = tablePositionDealer;
            }
          })
        }))
        break;
      }

      case 'ROUND_STARTED': {
        const { round } = event.payload;
        store.setState(produce(draft => {

        }))
      }
    }
  }
}