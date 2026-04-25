'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  MacrocycleInterface,
  MesocycleInterface,
  MicrocycleInterface,
} from '@/types/cycles/types';

export const cyclesKeys = {
  all: ['cycles'] as const,
  macrocycles: () => [...cyclesKeys.all, 'macrocycles'] as const,
  mesocycles: () => [...cyclesKeys.all, 'mesocycles'] as const,
  microcycles: () => [...cyclesKeys.all, 'microcycles'] as const,
};

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as T;
}

function invalidateAllCycles(qc: ReturnType<typeof useQueryClient>): void {
  void qc.invalidateQueries({ queryKey: cyclesKeys.all });
}

export function useMacrocycles() {
  return useQuery({
    queryKey: cyclesKeys.macrocycles(),
    queryFn: () => getJson<MacrocycleInterface[]>('/api/cycles/macrocycles'),
  });
}

export function useMicrocycles() {
  return useQuery({
    queryKey: cyclesKeys.microcycles(),
    queryFn: () => getJson<MicrocycleInterface[]>('/api/cycles/microcycles'),
  });
}

export interface SaveMacrocycleInput {
  id?: number | null;
  teamId: number | null;
  name?: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export function useSaveMacrocycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SaveMacrocycleInput) => {
      const { id, ...body } = input;
      return getJson<MacrocycleInterface>(
        id ? `/api/cycles/macrocycles/${id}` : '/api/cycles/macrocycles',
        {
          method: id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(id ? { id, ...body } : body),
        }
      );
    },
    onSuccess: () => invalidateAllCycles(qc),
  });
}

export function useDeleteMacrocycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) =>
      getJson<void>(`/api/cycles/macrocycles/${id}`, { method: 'DELETE' }),
    onSuccess: () => invalidateAllCycles(qc),
  });
}

export interface SaveMesocycleInput {
  id?: number | null;
  macrocycleId: number;
  name?: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export function useSaveMesocycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SaveMesocycleInput) => {
      const { id, ...body } = input;
      return getJson<MesocycleInterface>(
        id ? `/api/cycles/mesocycles/${id}` : '/api/cycles/mesocycles',
        {
          method: id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );
    },
    onSuccess: () => invalidateAllCycles(qc),
  });
}

export function useDeleteMesocycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) =>
      getJson<void>(`/api/cycles/mesocycles/${id}`, { method: 'DELETE' }),
    onSuccess: () => invalidateAllCycles(qc),
  });
}

export interface SaveMicrocyclePayload {
  id?: number | null;
  number: number | null;
  name?: string;
  startDate: string;
  endDate: string;
  notes?: string;
  mesocycleId?: number;
  mesocycle?: { id: number };
  sessionGoals?: MicrocycleInterface['sessionGoals'];
}

export function useSaveMicrocycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SaveMicrocyclePayload) => {
      const { id, ...body } = input;
      return getJson<MicrocycleInterface>(
        id ? `/api/cycles/microcycles/${id}` : '/api/cycles/microcycles',
        {
          method: id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );
    },
    onSuccess: () => invalidateAllCycles(qc),
  });
}

export function useDeleteMicrocycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) =>
      getJson<void>(`/api/cycles/microcycles/${id}`, { method: 'DELETE' }),
    onSuccess: () => invalidateAllCycles(qc),
  });
}
