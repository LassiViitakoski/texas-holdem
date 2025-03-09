// src/stores/gameStore.ts
import { Store } from '@tanstack/react-store'
import { produce } from 'immer' // Optional but recommended for immutable updates
import type { RoundPhase, Card, PokerAction, CardNotation } from '@texas-holdem/shared-types'

export type User = {
  id: number
}

export type Player = {
  id: number
  userId: number
  stack: number
  username: string
}

export type RoundPlayer = {
  id: number
  userId: number
  initialStack: number
  cards?: CardNotation[]
}

export type BettingRoundPlayer = {
  id: number
  userId: number
  position: number
  hasFolded: boolean
  hasActed: boolean
}

export type BettingRoundActions = {
  id: number
  type: PokerAction
  amount: number
  sequence: number
  userId: number
}

export type BettingRound = {
  id: number
  type: RoundPhase
  isFinished: boolean
  actions: BettingRoundActions[]
  players: BettingRoundPlayer[]
  activeUserId: number
}

export type Round = {
  id: number
  phase: RoundPhase // TODO
  isFinished: boolean
  communityCards: Card[]
  pot: number
  players: RoundPlayer[]
  bettingRounds: BettingRound[]
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
  userId: number | null
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
              tablePosition.userId = event.payload.player.userId;
              tablePosition.isActive = true;
            }
          })
        }))
        break

      case 'ROUND_CARDS_DEALT': {
        const cardsPayload = event.payload as { user: User, cards: CardNotation[] }[];
        store.setState(produce(draft => {
          if (!draft.activeRound) {
            throw new Error('No active round found');
          }

          console.log({
            cardsPayloadLength: cardsPayload.length,
            roundPlayersLength: draft.activeRound.players.length,
          })

          if (cardsPayload.length !== draft.activeRound.players.length) {
            throw new Error('Cards length does not match players length');
          }

          draft.activeRound.players.forEach((player, index) => {
            if (player.userId !== cardsPayload[index].user.id) {
              throw new Error('Round player does not match cards payload');
            }

            draft.activeRound!.players[index].cards = cardsPayload[index].cards;
          })
        }))
        break
      }

      case 'COMMUNITY_CARDS_UPDATED':
        store.setState(produce(draft => {
          draft.communityCards = event.payload.cards
          draft.phase = event.payload.phase
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
        const { round, update } = event.payload as { round: Round, update: { playerStacks: Record<string, number> } };
        store.setState(produce(draft => {
          draft.activeRound = {
            id: round.id,
            isFinished: round.isFinished,
            pot: round.pot,
            phase: round.phase, // TODO
            players: round.players,
            communityCards: round.communityCards,
            bettingRounds: round.bettingRounds.map((bettingRound) => {
              return {
                id: bettingRound.id,
                type: bettingRound.type,
                isFinished: bettingRound.isFinished,
                actions: bettingRound.actions,
                players: bettingRound.players,
                activeUserId: bettingRound.activeUserId,
              }
            })
          }

          draft.players.forEach((player, index) => {
            if (update.playerStacks[player.id]) {
              draft.players[index].stack = update.playerStacks[player.id];
            }
          })
        }))
      }
    }
  }
}