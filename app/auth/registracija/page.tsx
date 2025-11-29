
import { Suspense } from "react";
import RegistracijaClient from './RegistracijaClient';

export default async function RegistracijaPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams;
  const lang = typeof resolvedSearchParams?.lang === "string" ? resolvedSearchParams.lang : "sr";
  return (
    <Suspense fallback={null}>
      <RegistracijaClient lang={lang} />
    </Suspense>
  );
}