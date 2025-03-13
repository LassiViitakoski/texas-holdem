import { BettingRoundAction } from "@/stores/gameStore";

export const getAmountToCall = (userId: number, actions: BettingRoundAction[]) => {
  const requiredTotalContribution = actions.reduce((acc, action, index) => {
    if (action.type === 'RAISE') {
      return acc + action.amount;
    }

    // If the next action is not a blind, then the blind amount is added to the total contribution amount
    if (action.type === 'BLIND') {
      if (actions[index + 1]?.type !== 'BLIND') {
        return acc + action.amount;
      }
    }

    return acc;
  }, 0);

  const playerTotalContribution = actions.reduce(
    (acc, action) => (action.userId === userId ? acc + action.amount : acc),
    0,
  );

  return requiredTotalContribution - playerTotalContribution;
}

export const getLastRaiseAmount = (actions: BettingRoundAction[]) => {
  return actions.toReversed().find((action) => action.type === 'RAISE')?.amount ?? 0;
}
