import type {
  Blind,
  ChipUnit,
  PlayerActionTuple,
} from '@texas-holdem/shared-types';
import { Decimal } from 'decimal.js';
import { Round } from './round';
import { Player } from './player';
import { TablePosition } from './table-position';
import { playerRegistry, socketManager } from '../services';

interface GameConstructorProps {
  id: number;
  blinds: Blind<Decimal>[];
  maximumPlayers: number;
  minimumPlayers: number;
  chipUnit: ChipUnit;
  rake: Decimal;
  players: Player[];
  tablePositions?: TablePosition[];
}

export class Game {
  public id: number;

  public blinds: Blind<Decimal>[];

  public maximumPlayers: number;

  public minimumPlayers: number;

  public chipUnit: ChipUnit;

  public rake: Decimal;

  public players: Player[];

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
      blinds: this.blinds.map((blind) => ({ ...blind, amount: blind.amount.toNumber() })),
      maximumPlayers: this.maximumPlayers,
      minimumPlayers: this.minimumPlayers,
      chipUnit: this.chipUnit,
      rake: this.rake.toNumber(),
      players: this.players,
      tablePositions: this.tablePositions,
      activeRound: this.activeRound,
    };
  }

  private sortTablePositions(): void {
    this.tablePositions.sort((a, b) => a.position - b.position);
  }

  public isReadyToStart() {
    return this.players.length >= this.minimumPlayers
      && this.players.length <= this.maximumPlayers;
  }

  public isFull() {
    return this.players.length >= this.maximumPlayers;
  }

  public isPositionAvailable(positionId: number) {
    const tablePositionIndex = this.tablePositions.findIndex((pos) => pos.id === positionId);
    return tablePositionIndex !== -1 && this.tablePositions[tablePositionIndex].isPositionAvailable();
  }

  public join({ player, positionId }: { player: Player, positionId: number }) {
    if (this.players.some((p) => p.id === player.id)) {
      throw new Error('Player already joined the game {Game.join()}');
    }

    this.players.push(player);
    this.tablePositions = this.tablePositions.map((tablePosition) => {
      if (tablePosition.id === positionId) {
        if (tablePosition.isActive || tablePosition.playerId) {
          throw new Error('Table position is not available {Game.join()}');
        }

        tablePosition.activatePosition(player.id);
        return tablePosition;
      }

      return tablePosition;
    });
  }

  public async rotateDealer() {
    const tablePosDealer = this.tablePositions.find((tablePos) => tablePos.isDealer);
    const tablePosDealerNew = (() => {
      if (!tablePosDealer) {
        const activePositions = this.tablePositions.filter((tablePos) => tablePos.isPositionActive());

        if (activePositions.length === 0) {
          throw new Error('No active positions found {Game.rotateDealer()}.');
        }

        return activePositions[Math.floor(Math.random() * activePositions.length)];
      }

      return this.tablePositions.find((tablePos) => (
        tablePos.position > tablePosDealer.position && tablePos.isActive
      ))
          || this.tablePositions.find((tablePos) => (
            tablePos.position < tablePosDealer.position && tablePos.isActive
          ))
          || (() => { throw new Error('No new dealer found {Game.rotateDealer()}.'); })();
    })();

    if (tablePosDealer) {
      await tablePosDealer.removeDealer();
    }

    return tablePosDealerNew.setAsDealer();
  }

  public async initiateNewRound() {
    if (this.activeRound) {
      throw new Error('Round already ongoing.');
    }

    const dealerTablePosition = await this.rotateDealer();

    socketManager.emitGameEvent(this.id, {
      type: 'DEALER_ROTATED',
      payload: {
        tablePositionDealer: dealerTablePosition.toJSON(),
      },
    });

    const { round, playerStacks } = await Round.create(this);

    this.players.forEach((player, index) => {
      if (playerStacks[player.id]) {
        this.players[index].stack = playerStacks[player.id].updatedStack;
      }
    });

    this.activeRound = round;
    this.activeRound.informRoundStarted(this.id, playerStacks);
    return this.activeRound as Round;
  }

  public async handlePlayerAction(userId: number, actions: PlayerActionTuple) {
    const activeBettingRound = this.activeRound?.activeBettingRound;

    if (!activeBettingRound) {
      throw new Error('No active betting round found or active betting round is finished {Game.handlePlayerAction()}');
    }

    const bettingRoundPlayerId = playerRegistry.getEntityId({
      fromId: userId,
      from: 'user',
      to: 'bettingRoundPlayer',
    });

    const totalBet = await activeBettingRound.handlePlayerAction(
      bettingRoundPlayerId,
      actions,
      this.blinds.at(-1)?.amount || new Decimal(0),
    );

    if (totalBet.greaterThan(0)) {
      const playerId = playerRegistry.getEntityId({
        fromId: bettingRoundPlayerId,
        from: 'bettingRoundPlayer',
        to: 'player',
      });
      const player = this.players.find((p) => p.id === playerId);

      if (player) {
        await player.deductFromStack(totalBet);
      }
    }
  }
}
