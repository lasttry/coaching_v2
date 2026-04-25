'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SeasonInterface } from '@/types/season/types';

export const seasonsKeys = {
  all: ['seasons'] as const,
  list: () => [...seasonsKeys.all, 'list'] as const,
  current: () => [...seasonsKeys.all, 'current'] as const,
};

export interface CreateSeasonInput {
  name: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}

async function fetchSeasonsRequest(): Promise<SeasonInterface[]> {
  const res = await fetch('/api/seasons', { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as SeasonInterface[];
}

async function createSeasonRequest(input: CreateSeasonInput): Promise<SeasonInterface> {
  const res = await fetch('/api/seasons', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as SeasonInterface;
}

async function deleteSeasonRequest(id: number): Promise<void> {
  const res = await fetch(`/api/seasons/${id}`, { method: 'DELETE' });
  const data = await res.json().catch(() => null);
  if (!res.ok || !(data as { success?: boolean })?.success) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
}

async function setCurrentSeasonRequest(id: number): Promise<SeasonInterface> {
  const res = await fetch(`/api/seasons/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isCurrent: true }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as SeasonInterface;
}

async function fetchCurrentSeasonRequest(): Promise<SeasonInterface | null> {
  const res = await fetch('/api/seasons/current');
  if (!res.ok) {
    if (res.status === 404) return null;
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || `HTTP ${res.status}`);
  }
  return (await res.json()) as SeasonInterface;
}

export function useSeasons() {
  return useQuery({
    queryKey: seasonsKeys.list(),
    queryFn: fetchSeasonsRequest,
  });
}

export function useCurrentSeason() {
  return useQuery({
    queryKey: seasonsKeys.current(),
    queryFn: fetchCurrentSeasonRequest,
  });
}

export function useCreateSeason() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSeasonRequest,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: seasonsKeys.all });
    },
  });
}

export function useDeleteSeason() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSeasonRequest,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: seasonsKeys.list() });
      const previous = qc.getQueryData<SeasonInterface[]>(seasonsKeys.list());
      if (previous) {
        qc.setQueryData<SeasonInterface[]>(
          seasonsKeys.list(),
          previous.filter((s) => s.id !== id)
        );
      }
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(seasonsKeys.list(), ctx.previous);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: seasonsKeys.all });
    },
  });
}

export function useSetCurrentSeason() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: setCurrentSeasonRequest,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: seasonsKeys.all });
    },
  });
}
