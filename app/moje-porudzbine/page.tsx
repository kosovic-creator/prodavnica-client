
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { getPorudzbineKorisnika } from '@/lib/actions';

import MojePorudzbineClient from './MojePorudzbineClient';




export default async function MojePorudzbinePage({ searchParams }: { searchParams: Promise<{ page?: string; pageSize?: string; lang?: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/auth/prijava');
  }
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1');
  const pageSize = parseInt(resolvedSearchParams.pageSize || '10');
  const lang = resolvedSearchParams.lang || 'sr';
  const result = await getPorudzbineKorisnika(session.user.id, page, pageSize);
  if (!result.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">Greška pri učitavanju porudžbina</div>
          <p className="text-gray-600">{result.error}</p>
        </div>
      </div>
    );
  }
  const porudzbine = result.data?.porudzbine || [];
  const total = result.data?.total || 0;
  return (
    <MojePorudzbineClient
      porudzbine={porudzbine}
      total={total}
      page={page}
      pageSize={pageSize}
      lang={lang}
    />
  );
}