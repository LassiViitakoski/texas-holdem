import { Decimal } from 'decimal.js';
import type { Blind, IRound, IRoundPlayer } from '@texas-holdem/shared-types';
import { db } from '@texas-holdem/database-api';
import { BettingRound } from './betting-round';
import { Player } from '../player';
import { Card, Deck } from '../../models';
import { BettingRoundPlayer } from './betting-round-player';
import { BettingRoundPlayerAction } from './betting-round-player-action';
import { socketManager } from '../../services/socket-manager';

interface RoundConstructorParams {
  id: number;
  pot: Decimal;
  isFinished: boolean;
  bettingRounds: BettingRound[];
  players: IRoundPlayer[];
  deck: Deck;
}

export class Round implements IRound {
  public id: number;

  public pot: Decimal;

  public isFinished: boolean;

  public bettingRounds: BettingRound[];

  public players: IRoundPlayer[];

  public deck: Deck;

  static async create(gameId: number, players: Player[], blinds: Blind<Decimal>[]) {
    const deck = new Deck().shuffle();

    const roundCreationData = await db.round.create({
      gameId,
      pot: blinds.reduce((acc, blind) => acc.plus(blind.amount), new Decimal(0)),
      players: players.map((player, index) => ({
        id: player.id,
        stack: player.stack,
        sequence: index + 1,
        playerId: player.id,
        cards: [
          deck.draw().toString(),
          deck.draw().toString(),
        ],
      })),
      actions: blinds.map((blind, index) => ({
        sequence: index + 1,
        type: 'BLIND',
        amount: blind.amount,
      })),
    });

    const { firstBettingRound, roundPlayers, ...roundProps } = roundCreationData;

    const bettingRound = new BettingRound({
      ...firstBettingRound,
      players: firstBettingRound.players.map((betRoundPlayer) => new BettingRoundPlayer({
        ...betRoundPlayer,
        hasActed: false,
        hasFolded: false,
        actions: betRoundPlayer
          .actions
          .map((betRoundPlayerAction) => new BettingRoundPlayerAction(betRoundPlayerAction)),
      })),
    });

    const mappedRoundPlayers = roundPlayers.map((roundPlayer) => ({
      ...roundPlayer,
      cards: roundPlayer.cards.map((card) => Card.fromString(card)),
    }));

    return new Round({
      ...roundProps,
      deck,
      players: mappedRoundPlayers,
      bettingRounds: [bettingRound],
    });
  }

  constructor(params: RoundConstructorParams) {
    this.id = params.id;
    this.pot = params.pot;
    this.isFinished = params.isFinished;
    this.bettingRounds = params.bettingRounds;
    this.players = params.players;
    this.deck = params.deck;
  }

  public getNextToAct(): IRoundPlayer | undefined {
    return this.players
      .sort((a, b) => a.sequence - b.sequence)
      .find((p) => !p.hasActed);
  }

  public emitRoundStarted(gameId: number) {
    const roundPayload = {
      roundId: this.id,
      pot: this.pot,
      isFinished: this.isFinished,
      roundPlayers: this.players.map((roundPlayer) => ({
        id: roundPlayer.id,
        playerId: roundPlayer.playerId,
        stack: roundPlayer.stack,
      })),
      bettinRounds: this.bettingRounds.map((bettingRound) => ({
        id: bettingRound.id,
        isFinished: bettingRound.isFinished,
        bettingRoundPlayers: bettingRound.players.map((bettingRoundPlayer) => ({
          id: bettingRoundPlayer.id,
          hasActed: bettingRoundPlayer.hasActed,
          hasFolded: bettingRoundPlayer.hasFolded,
          sequence: bettingRoundPlayer.sequence,
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

    this.players.forEach((roundPlayer) => {
      const roundPlayerUserId = this.players.find((p) => p.id === roundPlayer.playerId)?.userId;

      if (!roundPlayerUserId) {
        throw new Error('User not found on {handleJoinGame()}');
      }

      socketManager.emitGameEvent(gameId, {
        type: 'ROUND_STARTED',
        payload: roundPayload,
      });

      socketManager.emitUserEvent(
        gameId,
        roundPlayerUserId,
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
