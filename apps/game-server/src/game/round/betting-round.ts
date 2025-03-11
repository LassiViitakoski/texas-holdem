import type { PlayerActionTuple, RoundPhase } from '@texas-holdem/shared-types';
import { Decimal } from 'decimal.js';
import { db } from '@texas-holdem/database-api';
import { BettingRoundPlayer } from '../player';
import { BettingRoundAction } from './betting-round-action';
import { playerRegistry } from '../../services';

interface BettingRoundProps {
  id: number;
  type: RoundPhase;
  isFinished: boolean;
  players: BettingRoundPlayer[];
  actions: BettingRoundAction[];
  activeBettingRoundPlayerId: number;
}

export class BettingRound {
  public id: number;

  public type: RoundPhase;

  public isFinished: boolean;

  public players: BettingRoundPlayer[];

  public actions: BettingRoundAction[];

  public activeBettingRoundPlayerId: number;

  constructor(params: BettingRoundProps) {
    this.id = params.id;
    this.type = params.type;
    this.isFinished = params.isFinished;
    this.players = params.players;
    this.actions = params.actions;
    this.activeBettingRoundPlayerId = params.activeBettingRoundPlayerId;
  }

  public toJSON() {
    return {
      id: this.id,
      type: this.type,
      isFinished: this.isFinished,
      players: this.players,
      actions: this.actions,
      activeUserId: playerRegistry.getEntityId({
        fromId: this.activeBettingRoundPlayerId,
        from: 'bettingRoundPlayer',
        to: 'user',
      }),
    };
  }

  public async handlePlayerAction(bettingRoundPlayerId: number, actions: PlayerActionTuple, bigBlindAmount: Decimal) {
    if (this.isFinished) {
      throw new Error('Betting round is finished {BettingRound.handlePlayerAction()}');
    }

    if (this.activeBettingRoundPlayerId !== bettingRoundPlayerId) {
      throw new Error('User is not the active betting round player {Game.handlePlayerAction()}');
    }

    this.validatePlayerActions(bettingRoundPlayerId, actions, bigBlindAmount);

    const [firstAction, secondAction] = actions;

    const latestActionSequence = this.actions.at(-1)?.sequence ?? 0;
    const [
      firstBettingRoundAction,
      secondBettingRoundAction,
    ] = await BettingRoundAction.createNormalizedPlayerActions([
      {
        bettingRoundPlayerId,
        bettingRoundId: this.id,
        sequence: latestActionSequence + 1,
        type: firstAction.type,
        amount: new Decimal(firstAction.amount ?? 0),
      },
      secondAction
        ? {
          bettingRoundPlayerId,
          bettingRoundId: this.id,
          sequence: latestActionSequence + 2,
          type: secondAction.type,
          amount: new Decimal(secondAction.amount ?? 0),
        }
        : undefined,
    ]);

    this.actions.push(firstBettingRoundAction);

    if (secondBettingRoundAction) {
      this.actions.push(secondBettingRoundAction);
    }

    this.players.forEach((brPlayer, index) => {
      if (brPlayer.id === bettingRoundPlayerId) {
        this.players[index].hasActed = true;
      }

      if (secondBettingRoundAction) {
        if (brPlayer.id !== bettingRoundPlayerId) {
          if (!brPlayer.hasFolded) {
            this.players[index].hasActed = false;
          }
        }
      }
    });

    const isEveryPlayerActed = this.players.every((brPlayer) => !brPlayer.hasFolded || brPlayer.hasActed);

    if (isEveryPlayerActed) {
      this.isFinished = (await db.bettingRound.update(this.id, {
        isFinished: true,
      })).isFinished;
    }

    return firstBettingRoundAction.amount.plus(secondBettingRoundAction?.amount ?? 0);
  }

  /**
   * Validate the player actions
   * @param bettingRoundPlayerId - The id of the betting round player
   * @param actions - The actions to validate
   * @param bigBlindAmount - The amount of the big (biggest) blind
   * @returns void
   * @throws Error - If the actions are invalid
   */
  public validatePlayerActions(bettingRoundPlayerId: number, actions: PlayerActionTuple, bigBlindAmount: Decimal) {
    const [firstAction, secondAction] = actions;

    if (firstAction.type !== 'CALL' && secondAction) {
      throw new Error('Invalid actions {BettingRound.validatePlayerActions()}');
    }

    if (firstAction.type === 'FOLD') {
      return;
    }

    const totalRaiseAmount = this.actions.reduce(
      (acc, action) => (action.type === 'RAISE' ? acc.plus(action.amount) : acc),
      new Decimal(0),
    );
    const requiredTotalContribution = totalRaiseAmount.plus(bigBlindAmount);
    const playerTotalContribution = this.actions.reduce(
      (acc, action) => (action.bettingRoundPlayerId === bettingRoundPlayerId ? acc.plus(action.amount) : acc),
      new Decimal(0),
    );

    const amountToCall = requiredTotalContribution.minus(playerTotalContribution);

    if (firstAction.type === 'CHECK') {
      if (!amountToCall.equals(0)) {
        throw new Error('Invalid CHECK action when amount to call is not 0 {BettingRound.validatePlayerActions()}');
      }
    }

    if (!amountToCall.equals(firstAction.amount ?? 0)) {
      throw new Error('Invalid CALL action amount {BettingRound.validateActionAmount()}');
    }

    if (secondAction) {
      const lastRaiseAmount = this.actions
        .toReversed()
        .find((action) => action.type === 'RAISE')?.amount ?? new Decimal(0);
      const minimumRaiseAmount = lastRaiseAmount.greaterThan(0) ? lastRaiseAmount : bigBlindAmount;

      if (minimumRaiseAmount.greaterThan(secondAction.amount ?? 0)) {
        throw new Error('Invalid RAISE action amount {BettingRound.validatePlayerActions()}');
      }
    }
  }
}
