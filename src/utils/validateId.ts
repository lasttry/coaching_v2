import { NextResponse } from 'next/server';

/**
 * Safely parse and validate a numeric route parameter.
 *
 * @param value - The raw string value from route params.
 * @param label - Optional label for error messages (e.g. "game", "team").
 * @returns A valid number if successful, or a NextResponse if invalid.
 */
export function parseAndValidateId(value: string | undefined, label = 'ID'): number | NextResponse {
  if (!value) {
    return NextResponse.json({ error: `${label} parameter is required` }, { status: 400 });
  }

  const num = Number(value);

  if (!Number.isFinite(num) || num <= 0) {
    return NextResponse.json({ error: `Invalid ${label} parameter` }, { status: 400 });
  }

  return num;
}
