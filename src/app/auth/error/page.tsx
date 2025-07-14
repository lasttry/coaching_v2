'use client';
import React, { ReactElement } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ErrorPage(): ReactElement {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div>
      <h1>Authentication Error</h1>
      {error && <p>Error: {error}</p>}
      <a href="/auth/login">Go back to login</a>
    </div>
  );
}
