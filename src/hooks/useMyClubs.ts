'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MyClub } from '@/app/api/accounts/me/clubs/route';

export interface MyClubsResponse {
  defaultClubId: number;
  clubs: MyClub[];
}

export const myClubsKeys = {
  all: ['my-clubs'] as const,
  list: () => [...myClubsKeys.all, 'list'] as const,
};

async function fetchMyClubsRequest(): Promise<MyClubsResponse> {
  const res = await fetch('/api/accounts/me/clubs');
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as MyClubsResponse;
}

async function setDefaultClubRequest(clubId: number): Promise<void> {
  const res = await fetch('/api/accounts/me/default-club', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clubId }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || `HTTP ${res.status}`);
  }
}

async function clearDefaultClubRequest(): Promise<void> {
  const res = await fetch('/api/accounts/me/default-club', { method: 'DELETE' });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || `HTTP ${res.status}`);
  }
}

export function useMyClubs() {
  return useQuery({
    queryKey: myClubsKeys.list(),
    queryFn: fetchMyClubsRequest,
    staleTime: 60_000,
  });
}

export function useSetDefaultClub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: setDefaultClubRequest,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: myClubsKeys.list() });
    },
  });
}

export function useClearDefaultClub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clearDefaultClubRequest,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: myClubsKeys.list() });
    },
  });
}
