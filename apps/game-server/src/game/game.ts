import { DatabaseApi } from '@texas-holdem/database-api';
import type {
  BettingRoundPlayerActionType,
  BettingRoundType,
  Blind,
  ChipUnit,
  IGame,
  IPlayer,
  IRound,
} from '@texas-holdem/shared-types';
import { Decimal } from 'decimal.js';
import {
  BettingRound,
  BettingRoundPlayer,
  BettingRoundPlayerAction,
  Round,
} from './round';
import { EventBus } from '../services/event-bus';

export class Game implements IGame {
  public id: number;

  public blinds: Blind<Decimal>[];

  public maximumPlayers: number;

  public minimumPlayers: number;

  public chipUnit: ChipUnit;

  public rake: Decimal;

  public players: IPlayer[];

  public activeRound?: IRound;

  constructor(params: IGame) {
    this.id = params.id;
    this.blinds = params.blinds;
    this.maximumPlayers = params.maximumPlayers;
    this.minimumPlayers = params.minimumPlayers;
    this.chipUnit = params.chipUnit;
    this.rake = params.rake;
    this.players = params.players;
  }

  public isReadyToStart() {
    console.log({
      activeRound: !!this.activeRound,
      playersLength: this.players.length,
      minimumPlayers: this.minimumPlayers,
      maximumPlayers: this.maximumPlayers,
    });
    return !this.activeRound
      && this.players.length >= this.minimumPlayers
      && this.players.length <= this.maximumPlayers;
  }

  public join(player: IPlayer) {
    this.players.push(player);
  }

  public async startNewRound() {
    if (this.activeRound) {
      throw new Error('Round already started');
    }

    const db = DatabaseApi.getInstance();
    const cards: string[][] = [
      ['Kc', 'Ac'],
      ['Kh', 'Ah'],
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
