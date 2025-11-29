import { Suspense } from "react";
import PrijavaClient from "./PrijavaClient";

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams;
  const lang = typeof resolvedSearchParams?.lang === "string" ? resolvedSearchParams.lang : "sr";
  return (
    <Suspense fallback={null}>
      <PrijavaClient lang={lang} />
    </Suspense>
  );
}

