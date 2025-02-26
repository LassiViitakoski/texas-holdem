import { DatabaseApi } from '@texas-holdem/database-api';
import type {
  Blind,
  ChipUnit,
  IRound,
  ITablePosition,
} from '@texas-holdem/shared-types';
import { Decimal } from 'decimal.js';
import {
  Round,
} from './round';
import { EventBus } from '../services/event-bus';
import { Player } from './player';

interface GameConstructorParams {
  id: number;
  blinds: Blind<Decimal>[];
  maximumPlayers: number;
  minimumPlayers: number;
  chipUnit: ChipUnit;
  rake: Decimal;
  players: Player[];
  tablePositions?: ITablePosition[];
}

export class Game {
  public id: number;

  public blinds: Blind<Decimal>[];

  public maximumPlayers: number;

  public minimumPlayers: number;

  public chipUnit: ChipUnit;

  public rake: Decimal;

  public players: Player[];

  public activeRound?: IRound;

  public tablePositions: ITablePosition[];

  constructor(params: GameConstructorParams) {
    this.id = params.id;
    this.blinds = params.blinds;
    this.maximumPlayers = params.maximumPlayers;
    this.minimumPlayers = params.minimumPlayers;
    this.chipUnit = params.chipUnit;
    this.rake = params.rake;
    this.players = params.players;
    this.tablePositions = params.tablePositions || [];
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

  public join(player: Player) {
    this.players.push(player);
  }

  public async startNewRound() {
    if (this.activeRound) {
      throw new Error('Round already started');
    }

    /*
    // 1. Find current dealer position
    const currentDealer = this.tablePositions.find((pos) => pos.isDealer);

    // 2. Calculate new dealer position
    const nextDealerPosition = this.getNextActivePosition(currentDealer.position);

    // 3. Create round players with correct sequences
    const roundPlayers = this.calculateRoundPositions(nextDealerPosition);

    // 4. Start the round with the calculated positions
    return this.createRound(roundPlayers);
    */

    /*
    // 1. Find dealer position
    const dealerPosition = this.tablePositions.find(pos => pos.isDealer);

    // 2. Create round players with sequences based on dealer
    const roundPlayers = this.getActivePlayers().map((player, index) => ({
      playerId: player.id,
      // Sequence starts from small blind (dealer + 1)
      sequence: this.calculateSequence(player.tablePosition.position, dealerPosition.position),
      stack: player.stack,
      cards: [],
    }));

    // 3. Create the round
    const round = await this.createRound(roundPlayers);
    return round;
    */

    this.activeRound = await Round.create(this.id, this.players, this.blinds);

    await EventBus.getInstance().publish(this.id, {
      type: 'round:started',
      payload: { roundId: this.activeRound!.id },
    });

    return this.activeRound as Round;
  }

  /*
  private calculateRoundPositions(dealerPosition: number): IRoundPlayer[] {
    const players: IRoundPlayer[] = [];
    let sequence = 1;

    // Small blind is first to act preflop
    const smallBlindPos = this.getNextActivePosition(dealerPosition);
    const bigBlindPos = this.getNextActivePosition(smallBlindPos);

    // Order: SB, BB, UTG, ... , Dealer
    let currentPos = smallBlindPos;
    do {
      const tablePosition = this.tablePositions.find((p) => p.position === currentPos);
      if (tablePosition && tablePosition.isActive) {
        players.push({
          sequence: sequence++,
          position: this.getPositionName(currentPos, dealerPosition),
          playerId: tablePosition.playerId,
          // ... other fields
        });
      }
      currentPos = this.getNextActivePosition(currentPos);
    } while (currentPos !== smallBlindPos);

    return players;
  }
  */

  /*
  private calculateSequence(playerPosition: number, dealerPosition: number): number {
    // Calculate sequence based on position relative to dealer
    // Small blind (dealer + 1) gets sequence 1
    // Big blind (dealer + 2) gets sequence 2
    // And so on...
    const relativePosition = (playerPosition - dealerPosition - 1 + 9) % 9;
    return relativePosition + 1;
  }
  */
}
