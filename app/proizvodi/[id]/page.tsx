
import { notFound } from 'next/navigation';
import ProizvodClient from './ProizvodClient';
import { getProizvodById } from './../../../lib/actions/proizvodi';

// This is a hybrid server/client page
export default async function ProizvodPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ lang?: string }> }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const lang = resolvedSearchParams?.lang || 'sr';
  const result = await getProizvodById(resolvedParams.id);
  if (!result.success || !result.data) notFound();
  const proizvod = result.data;

  // Render server + client boundary
  return <ProizvodClient proizvod={proizvod} lang={lang} />;
}
