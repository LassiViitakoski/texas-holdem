import { Decimal } from 'decimal.js';
import type { RoundPlayer } from '@texas-holdem/shared-types';
import { db } from '@texas-holdem/database-api';
import { BettingRound } from './betting-round';
import { Card, Deck } from '../../models';
import { BettingRoundPlayer } from './betting-round-player';
import { BettingRoundPlayerAction } from './betting-round-player-action';
import { socketManager } from '../../services/socket-manager';
import type { Game } from '../game';

interface RoundProps {
  id: number;
  pot: Decimal;
  isFinished: boolean;
  bettingRounds: BettingRound[];
  players: RoundPlayer[];
  deck: Deck;
  game: Game;
}

export class Round {
  public id: number;

  public pot: Decimal;

  public isFinished: boolean;

  public bettingRounds: BettingRound[];

  public players: Map<number, RoundPlayer>;

  public deck: Deck;

  private readonly game: Game;

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
      .filter((tablePosition) => tablePosition.isActive);

    const {
      firstBettingRound: firstBettingRoundDetails,
      roundPlayers: roundPlayersDetails,
      ...roundDetails
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
          ? game.blinds.toReversed()
          : game.blinds
        ),
      ].map((blind, index) => ({
        type: 'BLIND',
        amount: blind.amount,
        sequence: index + 1,
      })),
    });

    const bettingRound = new BettingRound({
      ...firstBettingRoundDetails,
      players: firstBettingRoundDetails.players.map((bettingRoundPlayer) => new BettingRoundPlayer({
        ...bettingRoundPlayer,
        hasActed: false,
        hasFolded: false,
        actions: bettingRoundPlayer
          .actions
          .map((bettingRoundPlayerAction) => new BettingRoundPlayerAction(bettingRoundPlayerAction)),
      })),
    });

    return new Round({
      ...roundDetails,
      deck,
      game,
      bettingRounds: [bettingRound],
      players: roundPlayersDetails.map((roundPlayer) => ({
        ...roundPlayer,
        cards: roundPlayer.cards.map((card) => Card.fromString(card)),
      })),
    });
  }

  constructor(params: RoundProps) {
    this.id = params.id;
    this.pot = params.pot;
    this.isFinished = params.isFinished;
    this.bettingRounds = params.bettingRounds;
    this.deck = params.deck;
    this.game = params.game;
    this.players = new Map(params.players.map((player) => [
      player.id,
      player,
    ]));
  }

  public emitRoundStarted(gameId: number) {
    const roundPayload = {
      roundId: this.id,
      pot: this.pot,
      isFinished: this.isFinished,
      roundPlayers: Array.from(this.players.values()).map((roundPlayer) => ({
        id: roundPlayer.id,
        playerId: roundPlayer.playerId,
        stack: roundPlayer.stack,
      })),
      bettinRounds: this.bettingRounds.map((bettingRound) => ({
        id: bettingRound.id,
        isFinished: bettingRound.isFinished,
        bettingRoundPlayers: Array.from(bettingRound.players.values()).map((bettingRoundPlayer) => ({
          id: bettingRoundPlayer.id,
          hasActed: bettingRoundPlayer.hasActed,
          hasFolded: bettingRoundPlayer.hasFolded,
          position: bettingRoundPlayer.position,
          stack: bettingRoundPlayer.stack,
          actions: bettingRoundPlayer.actions.map((action) => ({
            id: action.id,
            type: action.type,
            amount: action.amount,
            sequence: action.sequence,
          })),
        })),
      })),
    };

    socketManager.emitGameEvent(gameId, {
      type: 'ROUND_STARTED',
      payload: roundPayload,
    });

    this.players.forEach((roundPlayer) => {
      const playerId = this.players.get(roundPlayer.playerId)?.playerId;
      const userId = playerId ? this.game.players.get(playerId)?.userId : null;

      if (!userId) {
        throw new Error('User not found on {handleJoinGame()}');
      }

      socketManager.emitUserEvent(
        gameId,
        userId,
        {
          type: 'ROUND_CARDS_DEALT',
          payload: {
            cards: roundPlayer.cards,
          },
        },
      );
    });
  }
}
