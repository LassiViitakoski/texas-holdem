import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

export function useGameSocket(gameId: number) {
  useEffect(() => {
    const socket = io('http://localhost:3001');

    socket.emit('join-game', gameId);

    socket.on('game-update', (event) => {
      // Handle different game events
      switch (event.type) {
        case 'ROUND_STARTED':
          // Update UI
          break;
        case 'PLAYER_ACTION':
          // Update UI
          break;
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [gameId]);
} 