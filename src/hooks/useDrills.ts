'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  DrillGraphicInterface,
  DrillInterface,
  DrillTopicInterface,
  SaveDrillGraphicInput,
  SaveDrillInput,
  SaveDrillTopicInput,
} from '@/types/drills/types';

export interface DrillListFilters {
  search?: string;
  topicId?: number | null;
  echelonId?: number | null;
  type?: 'FUNDAMENTAL' | 'INDIVIDUAL' | 'TEAM' | null;
  position?: 'GUARD' | 'FORWARD' | 'CENTER' | null;
}

export const drillsKeys = {
  all: ['drills'] as const,
  list: (filters?: DrillListFilters) => [...drillsKeys.all, 'list', filters ?? {}] as const,
  detail: (id: number | null | undefined) => [...drillsKeys.all, 'detail', id] as const,
  topics: () => ['drillTopics'] as const,
};

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as T;
}

export function useDrills(filters?: DrillListFilters) {
  const qs = new URLSearchParams();
  if (filters?.search) qs.set('search', filters.search);
  if (filters?.topicId) qs.set('topicId', String(filters.topicId));
  if (filters?.echelonId) qs.set('echelonId', String(filters.echelonId));
  if (filters?.type) qs.set('type', filters.type);
  if (filters?.position) qs.set('position', filters.position);
  const query = qs.toString();
  return useQuery({
    queryKey: drillsKeys.list(filters),
    queryFn: () => getJson<DrillInterface[]>(`/api/drills${query ? `?${query}` : ''}`),
  });
}

export function useDrill(id: number | null | undefined) {
  return useQuery({
    queryKey: drillsKeys.detail(id),
    queryFn: () => getJson<DrillInterface>(`/api/drills/${id}`),
    enabled: !!id,
  });
}

export function useSaveDrill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveDrillInput) => {
      const { id, ...body } = input;
      return getJson<DrillInterface>(id ? `/api/drills/${id}` : '/api/drills', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    },
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: drillsKeys.all });
      if (data?.id) qc.setQueryData(drillsKeys.detail(data.id), data);
    },
  });
}

export function useDeleteDrill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => getJson<void>(`/api/drills/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: drillsKeys.all });
    },
  });
}

export function useDrillTopics() {
  return useQuery({
    queryKey: drillsKeys.topics(),
    queryFn: () => getJson<DrillTopicInterface[]>('/api/drills/topics'),
  });
}

export function useSaveDrillTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveDrillTopicInput) => {
      const { id, ...body } = input;
      return getJson<DrillTopicInterface>(id ? `/api/drills/topics/${id}` : '/api/drills/topics', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: drillsKeys.topics() });
    },
  });
}

export function useDeleteDrillTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => getJson<void>(`/api/drills/topics/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: drillsKeys.topics() });
      void qc.invalidateQueries({ queryKey: drillsKeys.all });
    },
  });
}

/* -------- Graphics -------- */

export function useAddDrillGraphic(drillId: number | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveDrillGraphicInput) =>
      getJson<DrillGraphicInterface>(`/api/drills/${drillId}/graphics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: drillsKeys.detail(drillId ?? null) });
      void qc.invalidateQueries({ queryKey: drillsKeys.all });
    },
  });
}

export function useUpdateDrillGraphic(drillId: number | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ graphicId, payload }: { graphicId: number; payload: SaveDrillGraphicInput }) =>
      getJson<DrillGraphicInterface>(`/api/drills/${drillId}/graphics/${graphicId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: drillsKeys.detail(drillId ?? null) });
    },
  });
}

export function useDeleteDrillGraphic(drillId: number | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (graphicId: number) =>
      getJson<void>(`/api/drills/${drillId}/graphics/${graphicId}`, { method: 'DELETE' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: drillsKeys.detail(drillId ?? null) });
    },
  });
}

export function useReorderDrillGraphics(drillId: number | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: number[]) =>
      getJson<DrillGraphicInterface[]>(`/api/drills/${drillId}/graphics/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: drillsKeys.detail(drillId ?? null) });
    },
  });
}
