'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { RecentColor } from '@/app/api/accounts/me/recent-colors/route';

export type { RecentColor };

export interface RecentColorsResponse {
  colors: RecentColor[];
}

export const recentColorsKeys = {
  all: ['drill-recent-colors'] as const,
  list: () => [...recentColorsKeys.all, 'list'] as const,
};

async function fetchRecentColorsRequest(): Promise<RecentColorsResponse> {
  const res = await fetch('/api/accounts/me/recent-colors');
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as RecentColorsResponse;
}

async function saveRecentColorsRequest(colors: RecentColor[]): Promise<RecentColorsResponse> {
  const res = await fetch('/api/accounts/me/recent-colors', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ colors }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as RecentColorsResponse;
}

export function useRecentColors() {
  return useQuery({
    queryKey: recentColorsKeys.list(),
    queryFn: fetchRecentColorsRequest,
    staleTime: 5 * 60_000,
  });
}

export function useSaveRecentColors() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveRecentColorsRequest,
    onMutate: async (next) => {
      await qc.cancelQueries({ queryKey: recentColorsKeys.list() });
      const prev = qc.getQueryData<RecentColorsResponse>(recentColorsKeys.list());
      qc.setQueryData<RecentColorsResponse>(recentColorsKeys.list(), {
        colors: next,
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(recentColorsKeys.list(), ctx.prev);
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: recentColorsKeys.list() });
    },
  });
}
