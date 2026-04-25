'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { OpponentInterface } from '@/types/opponent/types';

export const opponentsKeys = {
  all: ['opponents'] as const,
  list: () => [...opponentsKeys.all, 'list'] as const,
  detail: (id: number | null | undefined) => [...opponentsKeys.all, 'detail', id] as const,
};

async function fetchOpponentsRequest(): Promise<OpponentInterface[]> {
  const res = await fetch('/api/opponents');
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as OpponentInterface[];
}

async function saveOpponentRequest(opponent: OpponentInterface): Promise<OpponentInterface> {
  const hasId = opponent.id !== null && opponent.id !== undefined;
  const res = await fetch(hasId ? `/api/opponents/${opponent.id}` : '/api/opponents', {
    method: hasId ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(opponent),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as OpponentInterface;
}

async function deleteOpponentRequest(id: number): Promise<void> {
  const res = await fetch(`/api/opponents/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || `HTTP ${res.status}`);
  }
}

export function useOpponents() {
  return useQuery({ queryKey: opponentsKeys.list(), queryFn: fetchOpponentsRequest });
}

async function fetchOpponentRequest(id: number): Promise<OpponentInterface> {
  const res = await fetch(`/api/opponents/${id}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as OpponentInterface;
}

export function useOpponent(id: number | null | undefined) {
  return useQuery({
    queryKey: opponentsKeys.detail(id),
    queryFn: () => fetchOpponentRequest(id as number),
    enabled: !!id,
  });
}

export function useSaveOpponent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveOpponentRequest,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: opponentsKeys.list() });
    },
  });
}

export function useDeleteOpponent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteOpponentRequest,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: opponentsKeys.list() });
      const previous = qc.getQueryData<OpponentInterface[]>(opponentsKeys.list());
      if (previous) {
        qc.setQueryData<OpponentInterface[]>(
          opponentsKeys.list(),
          previous.filter((o) => o.id !== id)
        );
      }
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(opponentsKeys.list(), ctx.previous);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: opponentsKeys.list() });
    },
  });
}
