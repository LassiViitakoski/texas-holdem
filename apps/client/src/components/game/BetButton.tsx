import React, { useEffect } from 'react';
import { useGameSocket } from '../../hooks/useGameSocket';
import { useGameState } from '@/contexts/GameContext';

export const BetButton = ({ amount }: { amount: number }) => {
  const gameId = useGameState(state => state.gameId)
  const socketService = useGameSocket(gameId!);

  const handleBet = () => {
    socketService.placeBet(amount);
  };

  return <button onClick={handleBet}>Bet {amount}</button>;
}; 