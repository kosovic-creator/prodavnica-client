

import { Suspense } from 'react';
import KorpaClient from './KorpaClient';

export default async function KorpaPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams;
  const lang = typeof resolvedSearchParams?.lang === "string" ? resolvedSearchParams.lang : "sr";
  return (
        <Suspense fallback={null}>
          <KorpaClient lang={lang} />
        </Suspense>
      );
    }