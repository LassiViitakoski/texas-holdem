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
  activeBettingRoundPlayerId?: number | null;
}

export class BettingRound {
  public id: number;

  public type: RoundPhase;

  public isFinished: boolean;

  public players: BettingRoundPlayer[];

  public actions: BettingRoundAction[];

  public activeBettingRoundPlayerId: number | null;

  constructor(params: BettingRoundProps) {
    this.id = params.id;
    this.type = params.type;
    this.isFinished = params.isFinished;
    this.players = params.players;
    this.actions = params.actions;
    this.activeBettingRoundPlayerId = params.activeBettingRoundPlayerId ?? null;
  }

  public toJSON() {
    return {
      id: this.id,
      type: this.type,
      isFinished: this.isFinished,
      players: this.players,
      actions: this.actions,
      activeUserId: this.activeBettingRoundPlayerId ? playerRegistry.getEntityId({
        fromId: this.activeBettingRoundPlayerId,
        from: 'bettingRoundPlayer',
        to: 'user',
      }) : null,
    };
  }

  public getActivePlayers() {
    return this.players.filter((player) => !player.hasFolded);
  }

  public async finish() {
    await db.bettingRound.update(this.id, {
      isFinished: true,
    });

    this.isFinished = true;
    this.activeBettingRoundPlayerId = null;
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

    return {
      actions: [firstBettingRoundAction, ...(secondBettingRoundAction ? [secondBettingRoundAction] : [])],
      totalBet: firstBettingRoundAction.amount.plus(secondBettingRoundAction?.amount ?? 0),
    };
  }

  public async rotateActivePlayer() {
    const nextPlayerToAct = this.getNextPlayerToAct();

    if (!nextPlayerToAct) {
      await this.finish();
    }

    this.activeBettingRoundPlayerId = nextPlayerToAct;
    return this.activeBettingRoundPlayerId;
  }

  private getNextPlayerToAct() {
    const activeBrPlayerId = this.activeBettingRoundPlayerId;

    if (!activeBrPlayerId) {
      return this.players.at(0)?.id ?? null;
    }

    const activeBrPlayer = this.players.find((brPlayer) => brPlayer.id === activeBrPlayerId);

    if (!activeBrPlayer) {
      throw new Error('Active betting round player not found {BettingRound.getNextPlayerToAct()}');
    }

    const remainingActivePlayers = this.players.filter((brPlayer) => !brPlayer.hasActed && !brPlayer.hasFolded);

    if (remainingActivePlayers.length === 0) {
      return null;
    }

    const nextPlayerToAct = remainingActivePlayers.find((brPlayer) => brPlayer.position > activeBrPlayer.position)
      || remainingActivePlayers.at(0);

    return nextPlayerToAct!.id;
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

    const requiredTotalContribution = this.actions.reduce((acc, action, index) => {
      if (action.type === 'RAISE') {
        return acc.plus(action.amount);
      }

      // If the next action is not a blind, then the blind amount is added to the total contribution amount
      if (action.type === 'BLIND') {
        if (this.actions[index + 1]?.type !== 'BLIND') {
          return acc.plus(action.amount);
        }
      }

      return acc;
    }, new Decimal(0));

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

  public addPlayers(players: BettingRoundPlayer[]) {
    this.players.push(...players);
  }

  static async create(params: Pick<BettingRound, 'type' | 'isFinished' | 'players'> & { roundId: number }) {
    const creationData = await db.bettingRound.create({
      type: params.type,
      isFinished: params.isFinished,
      roundId: params.roundId,
    });

    return new BettingRound({
      id: creationData.id,
      type: creationData.type,
      isFinished: creationData.isFinished,
      players: params.players,
      actions: [],
    });
  }
}
