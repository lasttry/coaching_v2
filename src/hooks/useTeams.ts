'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TeamInterface } from '@/types/teams/types';

export const teamsKeys = {
  all: ['teams'] as const,
  list: () => [...teamsKeys.all, 'list'] as const,
  detail: (id: number | null | undefined) => [...teamsKeys.all, 'detail', id] as const,
};

async function fetchTeamsRequest(): Promise<TeamInterface[]> {
  const res = await fetch('/api/teams');
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as TeamInterface[];
}

async function saveTeamRequest(input: {
  id?: number | null;
  payload: Partial<TeamInterface> & { athleteIds?: number[] };
}): Promise<TeamInterface> {
  const { id, payload } = input;
  const res = await fetch(id ? `/api/teams/${id}` : '/api/teams', {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as TeamInterface;
}

async function deleteTeamRequest(id: number): Promise<void> {
  const res = await fetch(`/api/teams/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || `HTTP ${res.status}`);
  }
}

export function useTeams() {
  return useQuery({ queryKey: teamsKeys.list(), queryFn: fetchTeamsRequest });
}

async function fetchTeamRequest(id: number): Promise<TeamInterface> {
  const res = await fetch(`/api/teams/${id}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as TeamInterface;
}

export function useTeam(id: number | null | undefined) {
  return useQuery({
    queryKey: teamsKeys.detail(id),
    queryFn: () => fetchTeamRequest(id as number),
    enabled: !!id,
  });
}

export function useSaveTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveTeamRequest,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: teamsKeys.list() });
    },
  });
}

export function useDeleteTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTeamRequest,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: teamsKeys.list() });
      const previous = qc.getQueryData<TeamInterface[]>(teamsKeys.list());
      if (previous) {
        qc.setQueryData<TeamInterface[]>(
          teamsKeys.list(),
          previous.filter((team) => team.id !== id)
        );
      }
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(teamsKeys.list(), ctx.previous);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: teamsKeys.list() });
    },
  });
}
