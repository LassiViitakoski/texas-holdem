import { Decimal } from 'decimal.js';
import type { Blind, IRound, IRoundPlayer } from '@texas-holdem/shared-types';
import { db } from '@texas-holdem/database-api';
import { BettingRound } from './betting-round';
import { Player } from '../player';
import { Card, Deck } from '../../models';
import { BettingRoundPlayer } from './betting-round-player';
import { BettingRoundPlayerAction } from './betting-round-player-action';

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

    // Create and return new Round instance
    return new Round({
      ...roundProps,
      players: roundPlayers.map((roundPlayer) => ({
        ...roundPlayer,
        cards: roundPlayer.cards.map((card) => Card.fromString(card)),
      })),
      bettingRounds: [bettingRound],
      deck,
    });

    // return Round.fromData(roundData);
  }

  constructor(params: RoundConstructorParams) {
    this.id = params.id;
    this.pot = params.pot;
    this.isFinished = params.isFinished;
    this.bettingRounds = params.bettingRounds;
    this.players = params.players;
    this.deck = params.deck;
  }

  public getNextToAct(): IRoundPlayer {
    return this.players
      .sort((a, b) => a.sequence - b.sequence)
      .find((p) => !p.hasActed);
  }
}
