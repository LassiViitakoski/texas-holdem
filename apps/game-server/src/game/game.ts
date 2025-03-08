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

  public toJSON() {
    return {
      id: this.id,
      blinds: this.blinds,
      maximumPlayers: this.maximumPlayers,
      minimumPlayers: this.minimumPlayers,
      chipUnit: this.chipUnit,
      rake: this.rake,
      players: Array.from(this.players.values()),
      tablePositions: this.tablePositions,
      activeRound: this.activeRound,

    };
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

  public isPositionAvailable(positionId: number) {
    const tablePositionIndex = this.tablePositions.findIndex((pos) => pos.id === positionId);
    return tablePositionIndex !== -1
      && !this.tablePositions[tablePositionIndex].isActive
      && !this.tablePositions[tablePositionIndex].playerId;
  }

  public join({ player, positionId }: { player: Player, positionId: number }) {
    this.players.set(player.id, player);
    this.tablePositions = this.tablePositions.map((tablePosition) => {
      if (tablePosition.id === positionId) {
        if (tablePosition.isActive || tablePosition.playerId) {
          throw new Error('Table position is not available {Game.join()}');
        }

        return { ...tablePosition, playerId: player.id } as TablePosition;
      }

      return tablePosition;
    });
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
