import { BettingRoundAction } from "@/stores/gameStore";
import { RoundPhase } from "@texas-holdem/shared-types";

export const getAmountToCall = (userId: number, actions: BettingRoundAction[], roundPhase: RoundPhase) => {
  const totalRaiseAmount = actions.reduce(
    (acc, action) => (action.type === 'RAISE' ? acc + action.amount : acc),
    0,
  );

  const bigBlindAmount = actions.toReversed().find((action) => action.type === 'BLIND')?.amount ?? 0;
  const requiredTotalContribution = roundPhase === 'PREFLOP' ? totalRaiseAmount + bigBlindAmount : totalRaiseAmount;
  const playerTotalContribution = actions.reduce(
    (acc, action) => (action.userId === userId ? acc + action.amount : acc),
    0,
  );

  return requiredTotalContribution - playerTotalContribution;
}

export const getLastRaiseAmount = (actions: BettingRoundAction[]) => {
  return actions.toReversed().find((action) => action.type === 'RAISE')?.amount ?? 0;
}
