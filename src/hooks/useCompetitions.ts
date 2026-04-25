'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CompetitionInterface } from '@/types/competition/types';

export const competitionsKeys = {
  all: ['competitions'] as const,
  list: () => [...competitionsKeys.all, 'list'] as const,
};

async function fetchCompetitionsRequest(): Promise<CompetitionInterface[]> {
  const res = await fetch('/api/competition');
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as CompetitionInterface[];
}

async function saveCompetitionRequest(
  competition: CompetitionInterface
): Promise<CompetitionInterface> {
  const hasId = !!competition.id;
  const res = await fetch(hasId ? `/api/competition/${competition.id}` : '/api/competition', {
    method: hasId ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(competition),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as CompetitionInterface;
}

async function deleteCompetitionRequest(id: number): Promise<void> {
  const res = await fetch(`/api/competition/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || `HTTP ${res.status}`);
  }
}

export function useCompetitions() {
  return useQuery({ queryKey: competitionsKeys.list(), queryFn: fetchCompetitionsRequest });
}

export function useSaveCompetition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveCompetitionRequest,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: competitionsKeys.list() });
    },
  });
}

export function useDeleteCompetition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCompetitionRequest,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: competitionsKeys.list() });
      const previous = qc.getQueryData<CompetitionInterface[]>(competitionsKeys.list());
      if (previous) {
        qc.setQueryData<CompetitionInterface[]>(
          competitionsKeys.list(),
          previous.filter((c) => c.id !== id)
        );
      }
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(competitionsKeys.list(), ctx.previous);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: competitionsKeys.list() });
    },
  });
}
