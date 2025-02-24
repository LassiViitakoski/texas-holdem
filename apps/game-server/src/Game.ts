import { DatabaseApi } from '@texas-holdem/database-api';
import type {
  BettingRoundPlayerActionType,
  BettingRoundType,
  Blind, Card, ChipUnit,
  Game as GameType,
  Player,
  Round as RoundType,
} from '@texas-holdem/shared-types';
import { Decimal } from 'decimal.js';

import { Round } from './round';
import { BettingRound } from './betting-round';
import { BettingRoundPlayer } from './betting-round-player';
import { BettingRoundPlayerAction } from './betting-round-player-action';
import { EventBus } from './services/event-bus';

type GameConstructorParams = GameType;

export class Game implements GameType {
  public id: number;

  public blinds: Blind<Decimal>[];

  public maximumPlayers: number;

  public minimumPlayers: number;

  public chipUnit: ChipUnit;

  public rake: Decimal;

  public players: Player[];

  public activeRound?: RoundType;

  constructor(params: GameConstructorParams) {
    this.id = params.id;
    this.blinds = params.blinds;
    this.maximumPlayers = params.maximumPlayers;
    this.minimumPlayers = params.minimumPlayers;
    this.chipUnit = params.chipUnit;
    this.rake = params.rake;
    this.players = params.players;
  }

  public isReadyToStart() {
    return this.players.length >= this.minimumPlayers
      && this.players.length <= this.maximumPlayers;
  }

  public async startNewRound() {
    if (this.activeRound) {
      throw new Error('Round already started');
    }

    const db = DatabaseApi.getInstance();
    const cards: Card[][] = [
      [{ id: 12, rank: 'KING', suit: 'CLUB' }, { id: 13, rank: 'ACE', suit: 'CLUB' }],
      [{ id: 38, rank: 'KING', suit: 'HEART' }, { id: 39, rank: 'ACE', suit: 'HEART' }],
    ];
    const roundCreationData = await db.round.create({
      gameId: this.id,
      pot: this.blinds.reduce((acc, blind) => acc.plus(blind.amount), new Decimal(0)),
      players: this.players.map((player, index) => ({
        id: undefined,
        playerId: player.id,
        stack: player.stack,
        sequence: index + 1,
        cards: cards[index],
      })),
      actions: this.blinds.map((blind, index) => ({
        id: undefined,
        sequence: index + 1,
        type: 'BLIND',
        amount: blind.amount,
        bettingRoundPlayerId: undefined,
      })),
    });

    this.activeRound = new Round({
      id: roundCreationData.id,
      pot: roundCreationData.pot,
      isFinished: roundCreationData.isFinished,
      bettingRounds: roundCreationData.bettingRounds.map((br) => new BettingRound({
        id: br.id,
        type: br.type as BettingRoundType,
        isFinished: br.isFinished,
        players: br.players.map((brp) => new BettingRoundPlayer({
          id: brp.id,
          stack: brp.stack,
          sequence: brp.sequence,
          roundPlayerId: brp.roundPlayerId,
          actions: brp.actions.map((action) => new BettingRoundPlayerAction({
            id: action.id,
            sequence: action.sequence,
            type: action.type as BettingRoundPlayerActionType,
            amount: action.amount,
            bettingRoundPlayerId: action.bettingRoundPlayerId,
          })),
        })),
      })),
      players: roundCreationData.roundPlayers.map((rp) => ({
        id: rp.id,
        stack: rp.stack,
        playerId: rp.playerId,
        sequence: rp.sequence,
        cards: cards[rp.sequence - 1],
      })),
    });

    await EventBus.getInstance().publish(this.id, {
      type: 'round:started',
      payload: { roundId: this.activeRound.id },
    });

    return this.activeRound as Round;
  }
}
