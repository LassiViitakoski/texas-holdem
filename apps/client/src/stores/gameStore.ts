// src/stores/gameStore.ts
import { Store } from '@tanstack/react-store'
import { produce } from 'immer' // Optional but recommended for immutable updates
import type { RoundPhase, Card, PokerAction, CardNotation, PlayerAction, PlayerActionTuple } from '@texas-holdem/shared-types'
import { socketService } from '@/services/socket'

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
  isWinner: boolean
  winnings: number
  cards: CardNotation[]
  showdownHand?: {
    cards: CardNotation[]
    name: string
  }
}

export type BettingRoundPlayer = {
  id: number
  userId: number
  position: number
  hasFolded: boolean
  hasActed: boolean
}

export type BettingRoundAction = {
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
  actions: BettingRoundAction[]
  players: Map<number, BettingRoundPlayer>
  activeUserId: number
  actionTimeout: boolean;
  timeToActSeconds: number
}

export type Round = {
  id: number
  isFinished: boolean
  communityCards: Card[]
  pot: number
  players: Map<number, RoundPlayer>
  activeBettingRound: BettingRound | null
}

export type Blind = {
  id: number
  position: number
  amount: number
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
  players: Map<number, Player>
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
  players: new Map(),
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

export type GameActions = {
  handleSocketEvent: (store: GameStore, event: any) => void
  handlePlayerActionTimeout: (store: GameStore) => void
  handlePlayerAction: (store: GameStore, gameId: number, userId: number, payload: PlayerAction | PlayerActionTuple) => void
}

// Define action creators as pure functions
export const gameActions: GameActions = {
  handlePlayerAction: (_, gameId, userId, payload) => {
    // We could have action validation here
    socketService.sendAction(
      gameId,
      userId,
      Array.isArray(payload) ? payload : [payload]
    );
  },
  handlePlayerActionTimeout: (store) => {
    store.setState(produce(draft => {
      const activeBettingRound = draft.activeRound?.activeBettingRound;

      if (activeBettingRound) {
        activeBettingRound.actionTimeout = true;
      }
    }))
  },
  handleSocketEvent: (store, event) => {
    console.log('SOCKET EVENT RECEIVED', event);

    switch (event.type) {
      case 'PLAYER_JOINED':
        store.setState(produce(draft => {
          draft.players.set(event.payload.player.userId, event.payload.player)
          draft.tablePositions.forEach((tablePosition) => {
            if (tablePosition.id === event.payload.tablePositionId) {
              tablePosition.userId = event.payload.player.userId;
              tablePosition.isActive = true;
            }
          })
        }))
        break;


      case 'GAME_ROOM_JOIN_SUCCESS': {
        const { game } = event.payload;
        store.setState(produce(draft => {
          draft.id = game.id
          draft.blinds = game.blinds
          draft.maximumPlayers = game.maximumPlayers
          draft.minimumPlayers = game.minimumPlayers
          draft.chipUnit = game.chipUnit
          draft.rake = game.rake
          draft.players = new Map(game.players.map((player: any) => [player.userId, player]))
          draft.tablePositions = game.tablePositions
        }))
        break;
      }

      case 'DEALER_ROTATED': {
        const { tablePositionDealer } = event.payload;
        store.setState(produce(draft => {
          draft.tablePositions.forEach((tablePosition, index) => {
            if (tablePosition.id === tablePositionDealer.id) {
              draft.tablePositions[index] = tablePositionDealer;
            }
          })
        }))
        break;
      }

      case 'ROUND_STARTED': {
        const { round, update, timeToActSeconds } = event.payload as { round: any, update: { playerStacks: { userId: number, updatedStack: number }[] }, timeToActSeconds: number };
        store.setState(produce(draft => {
          draft.activeRound = {
            id: round.id,
            isFinished: round.isFinished,
            pot: round.pot,
            players: new Map(round.players.map((rPlayer: any) => [rPlayer.userId, rPlayer])),
            communityCards: round.communityCards,
            activeBettingRound: {
              id: round.activeBettingRound.id,
              type: round.activeBettingRound.type,
              isFinished: round.activeBettingRound.isFinished,
              actions: round.activeBettingRound.actions,
              players: new Map(round.activeBettingRound.players.map((brPlayer: any) => [brPlayer.userId, brPlayer])),
              activeUserId: round.activeBettingRound.activeUserId,
              actionTimeout: false,
              timeToActSeconds: timeToActSeconds,
            }
          }

          update.playerStacks.forEach((playerStack) => {
            const player = draft.players.get(playerStack.userId);

            if (!player) {
              throw new Error(`Stack update for non-existent player ${playerStack.userId} in {handleSocketEvent}`);
            }

            draft.players.set(player.userId, {
              ...player,
              stack: playerStack.updatedStack,
            })

          })
        }))
        break;
      }

      case 'NEW_BETTING_ROUND_STARTED': {
        const { round, timeToActSeconds } = event.payload as { round: any, timeToActSeconds: number };
        store.setState(produce(draft => {
          const { activeRound } = draft;
          if (!activeRound) {
            throw new Error('No active round found in {handleSocketEvent}');
          }

          activeRound.communityCards = round.communityCards;
          activeRound.activeBettingRound = {
            id: round.activeBettingRound.id,
            type: round.activeBettingRound.type,
            isFinished: round.activeBettingRound.isFinished,
            actions: round.activeBettingRound.actions,
            players: new Map(round.activeBettingRound.players.map((brPlayer: any) => [brPlayer.userId, brPlayer])),
            activeUserId: round.activeBettingRound.activeUserId,
            actionTimeout: false,
            timeToActSeconds: timeToActSeconds,
          }
        }))
        break;
      }

      case 'PLAYER_ACTION_SUCCESS': {
        const { actions, update, userId } = event.payload;
        store.setState(produce(draft => {
          const { activeRound } = draft;
          const activeBettingRound = activeRound?.activeBettingRound;
          const { players } = draft;

          if (!activeBettingRound) {
            throw new Error('No active betting round found in {handleSocketEvent}');
          }

          activeBettingRound.actions.push(...actions);

          if ('playerStack' in update) {
            const player = players.get(userId);

            if (player) {
              players.set(userId, {
                ...player,
                stack: update.playerStack,
              })
            }
          }

          if ('pot' in update) {
            activeRound.pot = update.pot;
          }

          activeBettingRound.activeUserId = update.activeUserId;
          activeBettingRound.actionTimeout = false;

          if ('isBettingRoundFinished' in update) {
            activeBettingRound.isFinished = update.isBettingRoundFinished;
          }
        }))
        break;
      }

      case 'REVEAL_PLAYER_HANDS': {
        const { playerHands } = event.payload;

        store.setState(produce(draft => {
          const { activeRound } = draft;

          if (!activeRound) {
            throw new Error('No active round found in {handleSocketEvent}');
          }

          playerHands.forEach((pHand: any) => {
            const roundPlayer = activeRound.players.get(pHand.userId);

            if (roundPlayer) {
              activeRound.players.set(roundPlayer.userId, {
                ...roundPlayer,
                cards: pHand.cards,
              });
            }
          })
        }))
        break;
      }

      case 'ROUND_FINISHED': {
        const { winners } = event.payload;

        store.setState(produce(draft => {
          const { activeRound } = draft;

          if (!activeRound) {
            throw new Error('No active round found in {handleSocketEvent}');
          }

          winners.forEach((winner: any) => {
            const player = draft.players.get(winner.userId);
            const roundPlayer = activeRound.players.get(winner.userId);

            if (roundPlayer) {
              activeRound.players.set(roundPlayer.userId, {
                ...roundPlayer,
                isWinner: true,
                winnings: winner.winnings,
                showdownHand: winner.showdownHand,
              });
            }

            if (player) {
              draft.players.set(player.userId, {
                ...player,
                stack: winner.playerStack,
              });
            }
          })
        }))
        break;
      }
    }
  }
}