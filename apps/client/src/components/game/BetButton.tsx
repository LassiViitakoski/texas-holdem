import React, { useEffect } from 'react';
import { useGameSocket } from '../../hooks/useGameSocket';

export const BetButton = ({ gameId, amount }: { gameId: number; amount: number }) => {
  const socketService = useGameSocket(gameId);

  const handleBet = () => {
    socketService.placeBet(amount);
  };

  return <button onClick={handleBet}>Bet {amount}</button>;
}; 