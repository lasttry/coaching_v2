'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EchelonInterface } from '@/types/echelons/types';

export const echelonsKeys = {
  all: ['echelons'] as const,
  list: () => [...echelonsKeys.all, 'list'] as const,
};

async function fetchEchelonsRequest(): Promise<EchelonInterface[]> {
  const res = await fetch('/api/echelons');
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as EchelonInterface[];
}

async function saveEchelonRequest(echelon: EchelonInterface): Promise<EchelonInterface> {
  const hasId = !!echelon.id;
  const res = await fetch(hasId ? `/api/echelons/${echelon.id}` : '/api/echelons', {
    method: hasId ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(echelon),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as EchelonInterface;
}

async function deleteEchelonRequest(id: number): Promise<void> {
  const res = await fetch(`/api/echelons/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || `HTTP ${res.status}`);
  }
}

export function useEchelons() {
  return useQuery({ queryKey: echelonsKeys.list(), queryFn: fetchEchelonsRequest });
}

export function useSaveEchelon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveEchelonRequest,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: echelonsKeys.list() });
    },
  });
}

export function useDeleteEchelon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteEchelonRequest,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: echelonsKeys.list() });
      const previous = qc.getQueryData<EchelonInterface[]>(echelonsKeys.list());
      if (previous) {
        qc.setQueryData<EchelonInterface[]>(
          echelonsKeys.list(),
          previous.filter((e) => e.id !== id)
        );
      }
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(echelonsKeys.list(), ctx.previous);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: echelonsKeys.list() });
    },
  });
}
