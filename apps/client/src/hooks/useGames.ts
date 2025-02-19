import { useMutation, useQuery } from '@tanstack/react-query';
import { CreateGamePayload, Game } from '@/types/game';

const API_BASE = '/api/games';

export function useCreateGame() {
  return useMutation({
    mutationFn: async (payload: CreateGamePayload) => {
      console.log('Payload', { payload })
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create game');
      }

      return response.json() as Promise<Game>;
    },
  });
}

export function useGame(id: number) {
  return useQuery({
    queryKey: ['game', id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch game');
      }

      return response.json() as Promise<Game>;
    },
  });
}

export function useGames() {
  return useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const response = await fetch(API_BASE);

      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }

      return response.json() as Promise<Game[]>;
    },
  });
} 