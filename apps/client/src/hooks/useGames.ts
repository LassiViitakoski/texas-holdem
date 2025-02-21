import { useMutation, useQuery } from '@tanstack/react-query';
import { CreateGamePayload, Game } from '@/types/game';

const API_BASE = '/api/games';

export function useCreateGame() {
  return useMutation({
    mutationFn: async (payload: CreateGamePayload) => {
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
    retry: false
  });
}

export function useGames() {
  return useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      try {
        const response = await fetch(API_BASE);

        if (!response.ok) {
          const error = await response.json().catch(() => null);
          throw new Error(error?.message || 'Unexepected error');
        }

        return response.json() as Promise<Game[]>;
      } catch (error) {
        throw new Error(`Fetching games failed: ${error instanceof Error ? error.message : 'Unexpected error'}`);
      }
    },
    retry: false,
    throwOnError: false,
  });
}
