'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ClubInterface } from '@/types/club/types';
import type { AccountClubInterface } from '@/types/accounts/types';
import type { Role } from '@prisma/client';

export const clubsKeys = {
  all: ['clubs'] as const,
  list: () => [...clubsKeys.all, 'list'] as const,
  detail: (id: number | null | undefined) => [...clubsKeys.all, 'detail', id] as const,
  accounts: (clubId: number | null | undefined) => [...clubsKeys.all, 'accounts', clubId] as const,
  emailSettings: (clubId: number | null | undefined) =>
    [...clubsKeys.all, 'emailSettings', clubId] as const,
};

async function fetchClubsRequest(): Promise<ClubInterface[]> {
  const res = await fetch('/api/clubs');
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return (data as ClubInterface[]).sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
}

async function createClubRequest(payload: Partial<ClubInterface>): Promise<ClubInterface> {
  const res = await fetch('/api/clubs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as ClubInterface;
}

async function deleteClubRequest(id: number): Promise<void> {
  const res = await fetch(`/api/clubs/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || `HTTP ${res.status}`);
  }
}

export function useClubs() {
  return useQuery({ queryKey: clubsKeys.list(), queryFn: fetchClubsRequest });
}

export function useCreateClub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createClubRequest,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: clubsKeys.list() });
    },
  });
}

export function useDeleteClub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteClubRequest,
    onSuccess: (_d, id) => {
      void qc.invalidateQueries({ queryKey: clubsKeys.list() });
      void qc.invalidateQueries({ queryKey: clubsKeys.detail(id) });
    },
  });
}

async function fetchClubAccountsRequest(clubId: number): Promise<AccountClubInterface[]> {
  const res = await fetch(`/api/clubs/${clubId}/accounts`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as AccountClubInterface[];
}

export function useClubAccounts(clubId: number | null | undefined) {
  return useQuery({
    queryKey: clubsKeys.accounts(clubId),
    queryFn: () => fetchClubAccountsRequest(clubId as number),
    enabled: !!clubId,
  });
}

export function useAddClubAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { clubId: number; accountId: number; roles: { role: Role }[] }) => {
      const res = await fetch(`/api/clubs/${input.clubId}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: input.accountId, roles: input.roles }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
      }
      return data as AccountClubInterface;
    },
    onSuccess: (_d, variables) => {
      void qc.invalidateQueries({ queryKey: clubsKeys.accounts(variables.clubId) });
    },
  });
}

export function useUpdateClubAccountRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      clubId: number;
      accountId: number;
      role: Role;
      checked: boolean;
    }) => {
      const res = await fetch(`/api/clubs/${input.clubId}/accounts/${input.accountId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: input.role, checked: input.checked }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || `HTTP ${res.status}`);
      }
    },
    onSuccess: (_d, variables) => {
      void qc.invalidateQueries({ queryKey: clubsKeys.accounts(variables.clubId) });
    },
  });
}

export interface ClubEmailSettings {
  enabled: boolean;
  host: string | null;
  port: number | null;
  secure: boolean;
  user: string | null;
  fromEmail: string | null;
  fromName: string | null;
  replyTo: string | null;
  hasPassword: boolean;
}

async function fetchClubEmailSettingsRequest(clubId: number): Promise<ClubEmailSettings> {
  const res = await fetch(`/api/clubs/${clubId}/email-settings`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as ClubEmailSettings;
}

export function useClubEmailSettings(clubId: number | null | undefined) {
  return useQuery({
    queryKey: clubsKeys.emailSettings(clubId),
    queryFn: () => fetchClubEmailSettingsRequest(clubId as number),
    enabled: !!clubId,
  });
}

export function useUpdateClubEmailSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { clubId: number; body: Record<string, unknown> }) => {
      const res = await fetch(`/api/clubs/${input.clubId}/email-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input.body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
      }
      return data as ClubEmailSettings;
    },
    onSuccess: (_d, variables) => {
      void qc.invalidateQueries({ queryKey: clubsKeys.emailSettings(variables.clubId) });
    },
  });
}

export function useSendTestEmail() {
  return useMutation({
    mutationFn: async (input: { clubId: number; to: string }) => {
      const res = await fetch(`/api/clubs/${input.clubId}/email-settings/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: input.to }),
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
        messageId?: string;
      } | null;
      if (!res.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }
      return data;
    },
  });
}

export function useRemoveClubAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { clubId: number; accountId: number }) => {
      const res = await fetch(`/api/clubs/${input.clubId}/accounts/${input.accountId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || `HTTP ${res.status}`);
      }
    },
    onSuccess: (_d, variables) => {
      void qc.invalidateQueries({ queryKey: clubsKeys.accounts(variables.clubId) });
    },
  });
}

async function fetchClubRequest(id: number): Promise<ClubInterface> {
  const res = await fetch(`/api/clubs/${id}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as ClubInterface;
}

async function updateClubRequest(input: {
  id: number;
  payload: Partial<ClubInterface>;
}): Promise<ClubInterface> {
  const res = await fetch(`/api/clubs/${input.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input.payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as ClubInterface;
}

export function useClub(id: number | null | undefined) {
  return useQuery({
    queryKey: clubsKeys.detail(id),
    queryFn: () => fetchClubRequest(id as number),
    enabled: !!id,
  });
}

export function useUpdateClub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateClubRequest,
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: clubsKeys.detail(variables.id) });
    },
  });
}
