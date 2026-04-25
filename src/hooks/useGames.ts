'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { GameInterface } from '@/types/game/types';

interface GamesResponse {
  games: GameInterface[];
}

export const gamesKeys = {
  all: ['games'] as const,
  list: () => [...gamesKeys.all, 'list'] as const,
};

async function fetchGamesRequest(): Promise<GameInterface[]> {
  const res = await fetch('/api/games');
  const data = (await res.json()) as GamesResponse | { error?: string };
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  const games = (data as GamesResponse).games ?? [];
  return [...games].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

async function saveGameRequest(game: GameInterface): Promise<GameInterface> {
  const hasId = !!game.id;
  const res = await fetch(hasId ? `/api/games/${game.id}` : '/api/games', {
    method: hasId ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(game),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as GameInterface;
}

async function deleteGameRequest(id: number): Promise<void> {
  const res = await fetch(`/api/games/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || `HTTP ${res.status}`);
  }
}

export function useGames() {
  return useQuery({ queryKey: gamesKeys.list(), queryFn: fetchGamesRequest });
}

export function useSaveGame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveGameRequest,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: gamesKeys.list() });
    },
  });
}

export function useDeleteGame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteGameRequest,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: gamesKeys.list() });
      const previous = qc.getQueryData<GameInterface[]>(gamesKeys.list());
      if (previous) {
        qc.setQueryData<GameInterface[]>(
          gamesKeys.list(),
          previous.filter((g) => g.id !== id)
        );
      }
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(gamesKeys.list(), ctx.previous);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: gamesKeys.list() });
    },
  });
}
