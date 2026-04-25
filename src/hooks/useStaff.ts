'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { StaffInterface, AvailableAccount } from '@/types/staff/types';

export const staffKeys = {
  all: ['staff'] as const,
  list: () => [...staffKeys.all, 'list'] as const,
  accounts: () => [...staffKeys.all, 'accounts'] as const,
};

async function fetchStaffRequest(): Promise<StaffInterface[]> {
  const res = await fetch('/api/staff');
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as StaffInterface[];
}

async function fetchStaffAccountsRequest(): Promise<AvailableAccount[]> {
  const res = await fetch('/api/staff/accounts');
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as AvailableAccount[];
}

async function saveStaffRequest(input: {
  id?: number | null;
  payload: StaffInterface & { teamIds: number[] };
}): Promise<StaffInterface> {
  const { id, payload } = input;
  const res = await fetch(id ? `/api/staff/${id}` : '/api/staff', {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as StaffInterface;
}

async function deleteStaffRequest(id: number): Promise<void> {
  const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || `HTTP ${res.status}`);
  }
}

export function useStaff() {
  return useQuery({ queryKey: staffKeys.list(), queryFn: fetchStaffRequest });
}

export function useStaffAccounts() {
  return useQuery({ queryKey: staffKeys.accounts(), queryFn: fetchStaffAccountsRequest });
}

export function useSaveStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveStaffRequest,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: staffKeys.all });
    },
  });
}

export function useDeleteStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteStaffRequest,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: staffKeys.list() });
      const previous = qc.getQueryData<StaffInterface[]>(staffKeys.list());
      if (previous) {
        qc.setQueryData<StaffInterface[]>(
          staffKeys.list(),
          previous.filter((s) => s.id !== id)
        );
      }
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(staffKeys.list(), ctx.previous);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: staffKeys.all });
    },
  });
}
