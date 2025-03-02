import type {
  Blind,
  ChipUnit,
} from '@texas-holdem/shared-types';
import { Decimal } from 'decimal.js';
import { Round } from './round';
import { Player } from './player';
import { TablePosition } from './table-position';

interface GameConstructorProps {
  id: number;
  blinds: Blind<Decimal>[];
  maximumPlayers: number;
  minimumPlayers: number;
  chipUnit: ChipUnit;
  rake: Decimal;
  players: Map<number, Player>;
  tablePositions?: TablePosition[];
}

export class Game {
  public id: number;

  public blinds: Blind<Decimal>[];

  public maximumPlayers: number;

  public minimumPlayers: number;

  public chipUnit: ChipUnit;

  public rake: Decimal;

  public players: Map<number, Player>;

  public activeRound?: Round;

  public tablePositions: TablePosition[];

  constructor(params: GameConstructorProps) {
    this.id = params.id;
    this.blinds = params.blinds;
    this.maximumPlayers = params.maximumPlayers;
    this.minimumPlayers = params.minimumPlayers;
    this.chipUnit = params.chipUnit;
    this.rake = params.rake;
    this.players = params.players;
    this.tablePositions = params.tablePositions || [];
    this.sortTablePositions();
  }

  private sortTablePositions(): void {
    this.tablePositions.sort((a, b) => a.position - b.position);
  }

  public isReadyToStart() {
    return this.players.size >= this.minimumPlayers
      && this.players.size <= this.maximumPlayers;
  }

  public isFull() {
    return this.players.size >= this.maximumPlayers;
  }

  public isPositionAvailable(position: number) {
    return position >= 1
      && position <= this.maximumPlayers
      && !this.tablePositions.some((pos) => pos.position === position);
  }

  public join({ player, tablePosition }: { player: Player, tablePosition: TablePosition }) {
    this.players.set(player.id, player);
    this.tablePositions.push(tablePosition);
    this.sortTablePositions();
  }

  public async rotateDealer() {
    const currentDealerTablePosition = this.tablePositions.find((pos) => pos.isDealer);

    const newDealerTablePosition = (() => {
      if (!currentDealerTablePosition) {
        const activePositions = this.tablePositions.filter((pos) => pos.isActive);

        if (activePositions.length === 0) {
          throw new Error('No active positions found {Game.rotateDealer()}.');
        }

        return activePositions[Math.floor(Math.random() * activePositions.length)];
      }

      return this.tablePositions.find((tablePos) => (
        tablePos.position > currentDealerTablePosition.position && tablePos.isActive
      ))
          || this.tablePositions.find((tablePos) => (
            tablePos.position < currentDealerTablePosition.position && tablePos.isActive
          ))
          || (() => { throw new Error('No new dealer found {Game.rotateDealer()}.'); })();
    })();

    if (currentDealerTablePosition) {
      await currentDealerTablePosition.removeDealer();
    }

    await newDealerTablePosition.setAsDealer();
    return newDealerTablePosition;
  }

  public async initiateNewRound() {
    if (this.activeRound) {
      throw new Error('Round already ongoing.');
    }

    await this.rotateDealer();
    this.activeRound = await Round.create(this);
    this.activeRound.emitRoundStarted(this.id);
    return this.activeRound as Round;
  }
}
