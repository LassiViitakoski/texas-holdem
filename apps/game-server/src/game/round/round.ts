import { Decimal } from 'decimal.js';
import { db } from '@texas-holdem/database-api';
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

  public players: Map<number, RoundPlayer>;

  public deck: Deck;

  public communityCards: Card[];

  constructor(params: RoundProps) {
    this.id = params.id;
    this.pot = params.pot;
    this.isFinished = params.isFinished;
    this.deck = params.deck;
    this.players = new Map(params.players.map((player) => [
      player.id,
      player,
    ]));
    this.bettingRounds = params.bettingRounds || [];
    this.communityCards = params.communityCards || [];
  }

  public toJSON() {
    return {
      id: this.id,
      pot: this.pot,
      isFinished: this.isFinished,
      players: Array.from(this.players.values()),
      bettingRounds: this.bettingRounds,
      communityCards: this.communityCards,
    };
  }

  public informRoundStarted(gameId: number) {
    socketManager.emitGameEvent(gameId, {
      type: 'ROUND_STARTS_SOON',
      payload: {
        secondsRemaining: 5,
      },
    });

    setTimeout(() => {
      socketManager.emitGameEvent(gameId, {
        type: 'ROUND_STARTED',
        payload: this.toJSON(),
      });

      this.players.forEach((rPlayer) => {
        const userId = playerRegistry.getEntityId({
          fromId: rPlayer.id,
          from: 'roundPlayer',
          to: 'user',
        });

        if (!userId) {
          throw new Error('User not found on {handleJoinGame()}');
        }

        socketManager.emitUserEvent(
          gameId,
          userId,
          {
            type: 'ROUND_CARDS_DEALT',
            payload: {
              cards: rPlayer.cards.map((card) => card.toString()),
            },
          },
        );
      });
    }, 5000);
  }

  static async create(game: Game) {
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

    const {
      firstBettingRound, roundPlayers, ...roundDetails
    } = await db.round.create({
      gameId: game.id,
      pot: game.blinds.reduce((acc, blind) => acc.plus(blind.amount), new Decimal(0)),
      players: positionsOrderedForRound.map(({ playerId }) => {
        const player = game.players.get(playerId!);

        if (!player) {
          throw new Error('Player ID not found on {Round.create()}');
        }

        return {
          id: player.id,
          stack: player.stack,
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
        cards: roundPlayer.cards.map((card) => Card.fromString(card)),
      })),
    });

    const bettingRound = new BettingRound({
      ...firstBettingRound,
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
