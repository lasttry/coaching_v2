'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AccountInterface } from '@/types/accounts/types';

export const accountsKeys = {
  all: ['accounts'] as const,
  list: () => [...accountsKeys.all, 'list'] as const,
  detail: (id: number | null | undefined) => [...accountsKeys.all, 'detail', id] as const,
};

export interface CreateAccountInput {
  name: string;
  email: string;
  password: string;
}

export interface UpdateAccountInput {
  id: number;
  name: string;
  email: string;
  defaultClubId?: number | null;
  image?: string | null;
  password?: string;
  oldPassword?: string;
}

async function fetchAccountsRequest(): Promise<AccountInterface[]> {
  const res = await fetch('/api/accounts');
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as AccountInterface[];
}

async function createAccountRequest(input: CreateAccountInput): Promise<AccountInterface> {
  const res = await fetch('/api/accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as AccountInterface;
}

async function updateAccountRequest(input: UpdateAccountInput): Promise<AccountInterface> {
  const { id, ...payload } = input;
  const res = await fetch(`/api/accounts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as AccountInterface;
}

async function deleteAccountRequest(id: number): Promise<void> {
  const res = await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || `HTTP ${res.status}`);
  }
}

async function fetchAccountRequest(id: number): Promise<AccountInterface> {
  const res = await fetch(`/api/accounts/${id}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as AccountInterface;
}

export function useAccounts() {
  return useQuery({ queryKey: accountsKeys.list(), queryFn: fetchAccountsRequest });
}

export function useAccount(id: number | null | undefined) {
  return useQuery({
    queryKey: accountsKeys.detail(id),
    queryFn: () => fetchAccountRequest(id as number),
    enabled: !!id,
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAccountRequest,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: accountsKeys.list() });
    },
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateAccountRequest,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: accountsKeys.list() });
    },
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAccountRequest,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: accountsKeys.list() });
      const previous = qc.getQueryData<AccountInterface[]>(accountsKeys.list());
      if (previous) {
        qc.setQueryData<AccountInterface[]>(
          accountsKeys.list(),
          previous.filter((a) => a.id !== id)
        );
      }
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(accountsKeys.list(), ctx.previous);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: accountsKeys.list() });
    },
  });
}
