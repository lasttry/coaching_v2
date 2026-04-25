'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EquipmentColorInterface, EquipmentItemInterface } from '@/types/equipmentColor/types';
import type { EquipmentInterface } from '@/types/equipment/types';

export const equipmentsKeys = {
  all: ['equipments'] as const,
  colors: (clubId?: number | null, seasonId?: number | null, echelonId?: number | null) =>
    [...equipmentsKeys.all, 'colors', { clubId, seasonId, echelonId }] as const,
  list: (clubId?: number | null, seasonId?: number | null) =>
    [...equipmentsKeys.all, 'list', { clubId, seasonId }] as const,
};

async function fetchClubEquipmentsRequest(
  clubId: number,
  seasonId: number
): Promise<EquipmentInterface[]> {
  const res = await fetch(`/api/clubs/${clubId}/seasons/${seasonId}/equipments`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as EquipmentInterface[];
}

export function useClubEquipments(
  clubId: number | null | undefined,
  seasonId: number | null | undefined
) {
  return useQuery({
    queryKey: equipmentsKeys.list(clubId, seasonId),
    queryFn: () => fetchClubEquipmentsRequest(clubId!, seasonId!),
    enabled: !!clubId && !!seasonId,
  });
}

async function fetchEquipmentColorsRequest(
  clubId: number,
  seasonId: number,
  echelonId?: number | null
): Promise<EquipmentColorInterface[]> {
  const url = echelonId
    ? `/api/clubs/${clubId}/seasons/${seasonId}/equipment-colors?echelonId=${echelonId}`
    : `/api/clubs/${clubId}/seasons/${seasonId}/equipment-colors`;
  const res = await fetch(url, { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as EquipmentColorInterface[];
}

export function useClubEquipmentColors(
  clubId: number | null | undefined,
  seasonId: number | null | undefined,
  echelonId: number | null | undefined
) {
  return useQuery({
    queryKey: equipmentsKeys.colors(clubId, seasonId, echelonId),
    queryFn: () => fetchEquipmentColorsRequest(clubId!, seasonId!, echelonId ?? null),
    enabled: !!clubId && !!seasonId,
  });
}

export interface CreateColorInput {
  clubId: number;
  seasonId: number;
  echelonId: number;
  color: string;
  colorHex: string;
  numberColorHex: string;
}

export interface UpdateColorInput {
  clubId: number;
  seasonId: number;
  id: number;
  color: string;
  colorHex: string;
  numberColorHex: string;
}

export interface CreateEquipmentInput {
  clubId: number;
  seasonId: number;
  colorId: number;
  number: number;
  size: string;
}

export interface UpdateEquipmentInput {
  clubId: number;
  seasonId: number;
  colorId: number;
  equipmentId: number;
  number: number | null | undefined;
  size: EquipmentItemInterface['size'];
}

function invalidate(qc: ReturnType<typeof useQueryClient>): void {
  void qc.invalidateQueries({ queryKey: equipmentsKeys.all });
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as T;
}

async function putJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as T;
}

async function del(url: string): Promise<void> {
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || `HTTP ${res.status}`);
  }
}

export function useCreateColor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clubId, seasonId, ...body }: CreateColorInput) =>
      postJson<EquipmentColorInterface>(
        `/api/clubs/${clubId}/seasons/${seasonId}/equipment-colors`,
        body
      ),
    onSuccess: () => invalidate(qc),
  });
}

export function useUpdateColor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clubId, seasonId, id, ...body }: UpdateColorInput) =>
      putJson<EquipmentColorInterface>(
        `/api/clubs/${clubId}/seasons/${seasonId}/equipment-colors/${id}`,
        body
      ),
    onSuccess: () => invalidate(qc),
  });
}

export function useDeleteColor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clubId, seasonId, id }: { clubId: number; seasonId: number; id: number }) =>
      del(`/api/clubs/${clubId}/seasons/${seasonId}/equipment-colors/${id}`),
    onSuccess: () => invalidate(qc),
  });
}

export function useCreateEquipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clubId, seasonId, colorId, ...body }: CreateEquipmentInput) =>
      postJson<EquipmentItemInterface>(
        `/api/clubs/${clubId}/seasons/${seasonId}/equipment-colors/${colorId}/equipments`,
        body
      ),
    onSuccess: () => invalidate(qc),
  });
}

export function useUpdateEquipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clubId, seasonId, colorId, equipmentId, ...body }: UpdateEquipmentInput) =>
      putJson<EquipmentItemInterface>(
        `/api/clubs/${clubId}/seasons/${seasonId}/equipment-colors/${colorId}/equipments/${equipmentId}`,
        body
      ),
    onSuccess: () => invalidate(qc),
  });
}

export function useDeleteEquipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      clubId,
      seasonId,
      colorId,
      equipmentId,
    }: {
      clubId: number;
      seasonId: number;
      colorId: number;
      equipmentId: number;
    }) =>
      del(
        `/api/clubs/${clubId}/seasons/${seasonId}/equipment-colors/${colorId}/equipments/${equipmentId}`
      ),
    onSuccess: () => invalidate(qc),
  });
}
