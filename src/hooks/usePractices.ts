'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ClubAttendanceReasonInterface,
  ClubPracticeSettingsInterface,
  PracticeInterface,
  PracticeItemInterface,
  SaveClubAttendanceReasonInput,
  SavePracticeInput,
  SavePracticeItemInput,
} from '@/types/practices/types';

export const practicesKeys = {
  all: ['practices'] as const,
  list: (params?: { from?: string; to?: string; teamId?: number | null }) =>
    [...practicesKeys.all, 'list', params ?? {}] as const,
  detail: (id: number | null | undefined) => [...practicesKeys.all, 'detail', id] as const,
  settings: () => ['practiceSettings'] as const,
  attendanceReasons: () => ['attendanceReasons'] as const,
};

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as T;
}

export function usePractices(params?: { from?: string; to?: string; teamId?: number | null }) {
  const qs = new URLSearchParams();
  if (params?.from) qs.set('from', params.from);
  if (params?.to) qs.set('to', params.to);
  if (params?.teamId) qs.set('teamId', String(params.teamId));
  const queryString = qs.toString();
  return useQuery({
    queryKey: practicesKeys.list(params),
    queryFn: () =>
      getJson<PracticeInterface[]>(`/api/practices${queryString ? `?${queryString}` : ''}`),
  });
}

export function usePractice(id: number | null | undefined) {
  return useQuery({
    queryKey: practicesKeys.detail(id),
    queryFn: () => getJson<PracticeInterface>(`/api/practices/${id}`),
    enabled: !!id,
  });
}

export function useSavePractice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SavePracticeInput) => {
      const { id, ...body } = input;
      return getJson<PracticeInterface>(id ? `/api/practices/${id}` : '/api/practices', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: practicesKeys.all });
    },
  });
}

export function useDeletePractice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => getJson<void>(`/api/practices/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: practicesKeys.all });
    },
  });
}

export interface DuplicatePracticeInput {
  sourceId: number;
  date: string;
  endTime: string;
  teamId?: number;
  copyItems?: boolean;
  copyAttendance?: boolean;
}

export function useDuplicatePractice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ sourceId, ...body }: DuplicatePracticeInput) =>
      getJson<PracticeInterface>(`/api/practices/${sourceId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: practicesKeys.all });
    },
  });
}

export function usePracticeSettings() {
  return useQuery({
    queryKey: practicesKeys.settings(),
    queryFn: () => getJson<ClubPracticeSettingsInterface>('/api/club/practice-settings'),
  });
}

export function useUpdatePracticeSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ClubPracticeSettingsInterface>) =>
      getJson<ClubPracticeSettingsInterface>('/api/club/practice-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      qc.setQueryData(practicesKeys.settings(), data);
    },
  });
}

/* -------- Practice Items -------- */

export function useAddPracticeItem(practiceId: number | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SavePracticeItemInput) =>
      getJson<PracticeItemInterface>(`/api/practices/${practiceId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: practicesKeys.all });
    },
  });
}

export function useUpdatePracticeItem(practiceId: number | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, payload }: { itemId: number; payload: SavePracticeItemInput }) =>
      getJson<PracticeItemInterface>(`/api/practices/${practiceId}/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: practicesKeys.all });
    },
  });
}

export function useDeletePracticeItem(practiceId: number | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: number) =>
      getJson<void>(`/api/practices/${practiceId}/items/${itemId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: practicesKeys.all });
    },
  });
}

export function useAttendanceReasons() {
  return useQuery({
    queryKey: practicesKeys.attendanceReasons(),
    queryFn: () => getJson<ClubAttendanceReasonInterface[]>('/api/practices/attendance-reasons'),
  });
}

export function useSaveAttendanceReason() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveClubAttendanceReasonInput) => {
      const isUpdate = !!input.id;
      const url = isUpdate
        ? `/api/practices/attendance-reasons/${input.id}`
        : '/api/practices/attendance-reasons';
      return getJson<ClubAttendanceReasonInterface>(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: input.name, order: input.order }),
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: practicesKeys.attendanceReasons() });
    },
  });
}

export function useDeleteAttendanceReason() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      getJson<{ ok: boolean }>(`/api/practices/attendance-reasons/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: practicesKeys.attendanceReasons() });
    },
  });
}

export function useReorderPracticeItems(practiceId: number | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) =>
      getJson<PracticeItemInterface[]>(`/api/practices/${practiceId}/items/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: practicesKeys.all });
    },
  });
}
