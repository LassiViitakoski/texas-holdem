import { Decimal } from 'decimal.js';
import { db } from '@texas-holdem/database-api';
import type { CardNotation } from '@texas-holdem/shared-types';
import { produce } from 'immer';
import { BettingRound } from './betting-round';
import { Card, Deck } from '../../models';
import { BettingRoundPlayer } from '../player/betting-round-player';
import { BettingRoundAction } from './betting-round-action';
import { socketManager } from '../../services/socket-manager';
import type { Game } from '../game';
import { RoundPlayer } from '../player/round-player';
import { playerRegistry } from '../../services/player-registry';

interface RoundProps {
  id: number;
  pot: Decimal;
  isFinished: boolean;
  players: RoundPlayer[];
  deck: Deck;
  bettingRounds?: BettingRound[];
  communityCards?: Card[];
}

export class Round {
  public id: number;

  public pot: Decimal;

  public isFinished: boolean;

  public bettingRounds: BettingRound[];

  public players: RoundPlayer[];

  public deck: Deck;

  public communityCards: Card[];

  constructor(params: RoundProps) {
    this.id = params.id;
    this.pot = params.pot;
    this.isFinished = params.isFinished;
    this.deck = params.deck;
    this.players = params.players;
    this.bettingRounds = params.bettingRounds || [];
    this.communityCards = params.communityCards || [];
  }

  public toJSON() {
    return {
      id: this.id,
      pot: this.pot,
      isFinished: this.isFinished,
      players: this.players,
      bettingRounds: this.bettingRounds,
      communityCards: this.communityCards,
    };
  }

  public informRoundStarted(gameId: number) {
    socketManager.emitGameEvent(gameId, {
      type: 'ROUND_STARTS_SOON',
      payload: {
        secondsRemaining: 2,
      },
    });

    setTimeout(() => {
      socketManager.emitGameEvent(gameId, {
        type: 'ROUND_STARTED',
        payload: {
          round: this.toJSON(),
        },
      });

      const eventPayloads = this.players.map((rPlayer) => {
        const userId = playerRegistry.getEntityId({
          fromId: rPlayer.id,
          from: 'roundPlayer',
          to: 'user',
        });

        if (!userId) {
          throw new Error('User not found on {handleJoinGame()}');
        }

        return {
          user: { id: userId },
          cards: rPlayer.cards.map(() => 'N/A'),
        };
      });

      this.players.forEach((rPlayer, index) => {
        const producedEventPayloads = produce(eventPayloads, (d) => {
          const draft = d; // Satisfy eslint (no-param-reassign)
          draft[index].cards = rPlayer.cards.map((card) => card.toString());
        });

        socketManager.emitUserEvent(
          gameId,
          producedEventPayloads[index].user.id,
          {
            type: 'ROUND_CARDS_DEALT',
            payload: producedEventPayloads,
          },
        );
      });
    }, 2000);
  }

  static async create(game: Game) { // TODO: Refactor to accept parameters instead of whole game instance
    const deck = new Deck().shuffle();
    const dealerIndex = game.tablePositions.findIndex((tablePosition) => tablePosition.isDealer);
    const dealer = game.tablePositions[dealerIndex];

    if (!dealer) {
      throw new Error('Dealer not found on {Round.create()}');
    }

    // Leaves dealer as last player to act
    const positionsOrderedForRound = [
      ...game.tablePositions.slice(dealerIndex + 1),
      ...game.tablePositions.slice(0, dealerIndex + 1),
    ]
      .filter((tablePosition) => tablePosition.isPositionActive());

    console.log('positionsOrderedForRound', positionsOrderedForRound);

    const {
      firstBettingRound, roundPlayers, ...roundDetails
    } = await db.round.create({
      gameId: game.id,
      pot: game.blinds.reduce((acc, blind) => acc.plus(blind.amount), new Decimal(0)),
      players: positionsOrderedForRound.map(({ playerId }, index) => {
        const player = game.players.find((p) => p.id === playerId);

        if (!player) {
          throw new Error('Player ID not found on {Round.create()}');
        }

        return {
          id: player.id,
          position: index + 1,
          initialStack: player.stack,
          playerId: player.id,
          cards: [
            deck.draw().toString(),
            deck.draw().toString(),
          ],
        };
      }),
      actions: [
        // Reverse blinds in head-to-head games
        ...(game.blinds.length === 2 && positionsOrderedForRound.length === 2
          ? (() => {
            const [smallBlind, bigBlind] = game.blinds;
            return [
              { ...bigBlind, position: smallBlind.position },
              { ...smallBlind, position: bigBlind.position },
            ];
          })()
          : game.blinds
        ),
      ].map((blind) => ({
        type: 'BLIND',
        amount: blind.amount,
        sequence: blind.position,
      })),
    });

    const round = new Round({
      ...roundDetails,
      deck,
      bettingRounds: [],
      players: roundPlayers.map((roundPlayer) => new RoundPlayer({
        ...roundPlayer,
        cards: roundPlayer.cards.map((card) => Card.fromString(card as CardNotation)),
      })),
      communityCards: roundDetails.communityCards.map((card) => Card.fromString(card as CardNotation)),
    });

    const bettingRound = new BettingRound({
      ...firstBettingRound,
      activeBettingRoundPlayerId: firstBettingRound.players.find((_, index) => !firstBettingRound.actions[index])
        ?.id || firstBettingRound.players[0].id,
      players: firstBettingRound.players.map((bettingRoundPlayer) => new BettingRoundPlayer({
        ...bettingRoundPlayer,
        hasActed: false,
        hasFolded: false,
      })),
      actions: firstBettingRound
        .actions
        .map((action) => new BettingRoundAction(action)),
    });

    round.bettingRounds.push(bettingRound);
    return round;
  }
}
