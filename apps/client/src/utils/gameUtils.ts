import { BettingRoundAction } from "@/stores/gameStore";

export const getAmountToCall = (userId: number, actions: BettingRoundAction[]) => {
  const totalRaiseAmount = actions.reduce(
    (acc, action) => (action.type === 'RAISE' ? acc + action.amount : acc),
    0,
  );

  const bigBlindAmount = actions.toReversed().find((action) => action.type === 'BLIND')?.amount ?? 0;
  const requiredTotalContribution = totalRaiseAmount + bigBlindAmount;
  const playerTotalContribution = actions.reduce(
    (acc, action) => (action.userId === userId ? acc + action.amount : acc),
    0,
  );

  console.log({ totalRaiseAmount, bigBlindAmount, requiredTotalContribution, playerTotalContribution });

  return requiredTotalContribution - playerTotalContribution;
}

export const getLastRaiseAmount = (actions: BettingRoundAction[]) => {
  return actions.toReversed().find((action) => action.type === 'RAISE')?.amount ?? 0;
}
