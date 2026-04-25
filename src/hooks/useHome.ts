'use client';

import { useQuery } from '@tanstack/react-query';
import type { HomeData } from '@/app/api/home/route';

export const homeKeys = {
  all: ['home'] as const,
  data: () => [...homeKeys.all, 'data'] as const,
};

async function fetchHomeRequest(): Promise<HomeData> {
  const res = await fetch('/api/home');
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  }
  return data as HomeData;
}

export function useHome() {
  return useQuery({
    queryKey: homeKeys.data(),
    queryFn: fetchHomeRequest,
    staleTime: 60_000,
  });
}
