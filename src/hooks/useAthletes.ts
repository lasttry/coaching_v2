'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AthleteInterface } from '@/types/athlete/types';

interface EquipmentColorOption {
  color: string;
  colorHex: string;
}

export const athletesKeys = {
  all: ['athletes'] as const,
  list: () => [...athletesKeys.all, 'list'] as const,
};

export const equipmentColorsKeys = {
  all: ['equipmentColors'] as const,
  list: () => [...equipmentColorsKeys.all, 'list'] as const,
};

async function fetchAthletesRequest(): Promise<AthleteInterface[]> {
  const res = await fetch('/api/athletes');
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  return data as AthleteInterface[];
}

async function fetchEquipmentColorsRequest(): Promise<EquipmentColorOption[]> {
  const res = await fetch('/api/equipments/colors');
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  return Array.isArray(data) ? (data as EquipmentColorOption[]) : [];
}

async function saveAthleteRequest(athlete: AthleteInterface): Promise<AthleteInterface> {
  const hasId = !!athlete.id;
  const method = hasId ? 'PUT' : 'POST';
  const url = hasId ? `/api/athletes/${athlete.id}` : '/api/athletes';
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(athlete),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Failed to save athlete');
  }
  return data as AthleteInterface;
}

async function deleteAthleteRequest(id: number): Promise<void> {
  const res = await fetch(`/api/athletes/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || `HTTP ${res.status}`);
  }
}

export function useAthletes() {
  return useQuery({
    queryKey: athletesKeys.list(),
    queryFn: fetchAthletesRequest,
  });
}

export function useEquipmentColors() {
  return useQuery({
    queryKey: equipmentColorsKeys.list(),
    queryFn: fetchEquipmentColorsRequest,
    staleTime: 5 * 60_000,
  });
}

export function useSaveAthlete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveAthleteRequest,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: athletesKeys.list() });
    },
  });
}

export function useDeleteAthlete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAthleteRequest,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: athletesKeys.list() });
      const previous = qc.getQueryData<AthleteInterface[]>(athletesKeys.list());
      if (previous) {
        qc.setQueryData<AthleteInterface[]>(
          athletesKeys.list(),
          previous.filter((a) => a.id !== id)
        );
      }
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        qc.setQueryData(athletesKeys.list(), context.previous);
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: athletesKeys.list() });
    },
  });
}
