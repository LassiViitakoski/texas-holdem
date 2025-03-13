import type {
  Blind,
  ChipUnit,
  PlayerActionTuple,
} from '@texas-holdem/shared-types';
import { Decimal } from 'decimal.js';
import { db } from '@texas-holdem/database-api';
import { SimpleIntervalJob, Task } from 'toad-scheduler';
import { Round } from '../round';
import { Player } from '../player';
import { TablePosition } from './table-position';
import { playerRegistry, socketManager, scheduler } from '../../services';

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

  private playerActionTimer?: SimpleIntervalJob;

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

    if (round.activeBettingRound?.activeBettingRoundPlayerId) {
      this.startPlayerActionTimer(round.activeBettingRound.activeBettingRoundPlayerId, 17);
    }

    return this.activeRound as Round;
  }

  public async handlePlayerAction(
    actions: PlayerActionTuple,
    userId?: number,
    bettingRoundPlayerId?: number,
  ) {
    this.cancelPlayerActionTimer();
    const { activeRound } = this;
    const activeBettingRound = activeRound?.activeBettingRound;

    if (!userId && !bettingRoundPlayerId) {
      throw new Error('User ID or Betting Round Player ID is required {Game.handlePlayerAction()}');
    }

    if (!activeBettingRound) {
      throw new Error('No active betting round found or active betting round is finished {Game.handlePlayerAction()}');
    }

    const brPlayerId = bettingRoundPlayerId || playerRegistry.getEntityId({
      fromId: userId!,
      from: 'user',
      to: 'bettingRoundPlayer',
    });

    const { actions: createdActions, ...updatedValues } = await db.service.executeTransaction(async () => {
      const {
        totalBet,
        actions: bettingRoundActions,
      } = await activeBettingRound.handlePlayerAction(
        brPlayerId,
        actions,
        this.blinds.at(-1)?.amount || new Decimal(0),
      );

      const playerId = playerRegistry.getEntityId({
        fromId: brPlayerId,
        from: 'bettingRoundPlayer',
        to: 'player',
      });

      const player = this.players.find((p) => p.id === playerId);

      if (!player) {
        throw new Error('Player not found {Game.handlePlayerAction()}');
      }

      const [playerStack, pot] = totalBet.greaterThan(0)
        ? await Promise.all([
          player.deductFromStack(totalBet),
          activeRound.addToPot(totalBet),
        ])
        : [];

      return {
        playerStack,
        pot,
        actions: bettingRoundActions,
      };
    });

    const activeBrPlayerId = await activeBettingRound.rotateActivePlayer();

    socketManager.emitGameEvent(this.id, {
      type: 'PLAYER_ACTION_SUCCESS',
      payload: {
        userId,
        actions: createdActions,
        update: {
          playerStack: updatedValues.playerStack?.toNumber(),
          pot: updatedValues.pot?.toNumber(),
          isBettingRoundFinished: activeBettingRound.isFinished,
          activeUserId: activeBrPlayerId
            ? playerRegistry.getEntityId({
              fromId: activeBrPlayerId,
              from: 'bettingRoundPlayer',
              to: 'user',
            })
            : null,
        },
      },
    });

    // Initiate new round
    if (activeBettingRound.isFinished) {
      const activeBrPlayers = activeBettingRound.getActivePlayers();

      if (activeBrPlayers.length === 1) {
        // await activeRound.complete();

        throw new Error('One player left socket event not yet implemented');
      }

      if (activeBettingRound.type === 'RIVER') {
        const activeRoundPlayers = activeRound.getActivePlayers(activeBettingRound);
        const winners = activeRound.evaluateShowdown(activeRoundPlayers);
        // COMPLETE ROUND
        throw new Error('River completion not implemented');
      }

      await activeRound.proceedToNextBettingRound(this.id);
    }
  }

  private startPlayerActionTimer(bettingRoundPlayerId: number, timeoutSeconds: number) {
    this.cancelPlayerActionTimer();

    const task = new Task(`action-timeout-task-${this.id}`, () => this.handlePlayerActionTimeout(bettingRoundPlayerId));

    // Create a one-time job that runs after timeoutSeconds
    this.playerActionTimer = new SimpleIntervalJob(
      { seconds: timeoutSeconds, runImmediately: false },
      task,
      {
        preventOverrun: true,
        id: `action-timeout-job-${this.id}`,
      },
    );

    scheduler.addSimpleIntervalJob(this.playerActionTimer);
  }

  private cancelPlayerActionTimer() {
    if (this.playerActionTimer) {
      if (this.playerActionTimer.id) {
        scheduler.removeById(this.playerActionTimer.id);
      }

      this.playerActionTimer = undefined;
    }
  }

  private handlePlayerActionTimeout(bettingRoundPlayerId: number) {
    console.log('handlePlayerActionTimeout', bettingRoundPlayerId);
    this.cancelPlayerActionTimer();
    const activeBettingRound = this.activeRound?.activeBettingRound;

    if (!activeBettingRound) {
      throw new Error('No active betting round found {Game.handlePlayerActionTimeout()}');
    }

    const requiredTotalContribution = activeBettingRound.actions.reduce((acc, action, index) => {
      if (action.type === 'RAISE') {
        return acc.plus(action.amount);
      }

      // If the next action is not a blind, then the blind amount is added to the total contribution amount
      if (action.type === 'BLIND') {
        if (activeBettingRound.actions[index + 1]?.type !== 'BLIND') {
          return acc.plus(action.amount);
        }
      }

      return acc;
    }, new Decimal(0));

    const playerTotalContribution = activeBettingRound.actions.reduce(
      (acc, action) => (action.bettingRoundPlayerId === bettingRoundPlayerId ? acc.plus(action.amount) : acc),
      new Decimal(0),
    );

    this.handlePlayerAction(
      [
        {
          type: requiredTotalContribution.equals(playerTotalContribution) ? 'CHECK' : 'FOLD',
        },
      ],
      undefined,
      bettingRoundPlayerId,
    );
  }
}
