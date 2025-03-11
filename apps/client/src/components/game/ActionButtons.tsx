import { useGameActions, useGameState } from '@/contexts/GameContext';
import { useLocalStorageUser } from '@/hooks/useUsers';
import { getAmountToCall, getLastRaiseAmount } from '@/utils/gameUtils';
import { useState } from 'react';

type ActionButtonsProps = {
  gameId: number;
  userId: number;
}

export const ActionButtons = ({
  gameId,
  userId,
}: ActionButtonsProps) => {
  const user = useLocalStorageUser();
  const actions = useGameActions();
  const game = useGameState((state) => state);

  const { activeBettingRound = null } = game.activeRound || {};
  const maximumBetAmount = game.players.get(user.id)?.stack || 0;


  console.log({ actions: activeBettingRound?.actions });

  const amountToCall = getAmountToCall(userId, activeBettingRound?.actions || []);
  const lastRaiseAmount = getLastRaiseAmount(activeBettingRound?.actions || []);
  const minimumRaiseAmount = lastRaiseAmount || game.blinds.at(-1)?.amount || 0;

  const [betAmount, setBetAmount] = useState(minimumRaiseAmount + amountToCall);

  const handleCheck = () => {
    actions.handlePlayerAction(gameId, userId, { type: 'CHECK' });
  }

  const handleCall = () => {
    actions.handlePlayerAction(gameId, userId, { type: 'CALL', amount: amountToCall });
  }

  const handleFold = () => {
    actions.handlePlayerAction(gameId, userId, { type: 'FOLD' });
  }

  const handleRaise = () => {
    actions.handlePlayerAction(
      gameId,
      userId,
      [
        { type: 'CALL', amount: amountToCall },
        { type: 'RAISE', amount: betAmount - amountToCall },
      ]);
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-[128px]">
      <div className="flex gap-1">
        {amountToCall === 0
          ? (
            <button
              onClick={handleCheck}
              className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded"
            >
              Check
            </button>
          )
          : (
            <button
              onClick={handleCall}
              className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded"
            >
              Call
            </button>
          )
        }
        <button
          onClick={handleFold}
          className="flex-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded"
        >
          Fold
        </button>
      </div>
      {maximumBetAmount > 0 && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 w-full">
            <input
              type="range"
              min={minimumRaiseAmount + amountToCall}
              max={maximumBetAmount}
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="w-full flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs text-white min-w-[25px] text-right flex-shrink-0">
              ${betAmount}
            </span>
          </div>
          <button
            onClick={() => handleRaise()}
            className="w-full px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded"
          >
            Raise ${betAmount}
          </button>
        </div>
      )}
    </div>
  );
}; 