
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { getPodaciPreuzimanja } from '@/lib/actions';

import sr from '@/i18n/locales/sr/podaci-preuzimanja.json';
import en from '@/i18n/locales/en/podaci-preuzimanja.json';
import ClientLayout from '../components/ClientLayout';

export default async function PodaciPreuzimanjaPage({ searchParams }: { searchParams?: Promise<{ lang?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const lang = params?.lang === 'en' ? 'en' : 'sr';
  const t = lang === 'en' ? en : sr;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/auth/prijava');
  }
  const isLoggedIn = !!session?.user;
  const korisnikIme = typeof session?.user?.name === 'string' ? session.user.name : undefined;

  const result = await getPodaciPreuzimanja(session.user.id);
  const podaci = result.success && result.data ? result.data : null;

  return (
    <ClientLayout lang={lang} isLoggedIn={isLoggedIn} korisnikIme={korisnikIme}>
      <div className="max-w-xl mx-auto py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">{t.naslov}</h1>
        <form className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">{t.adresa}</label>
              <input className="w-full border rounded px-3 py-2" value={podaci?.adresa || ''} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">{t.grad}</label>
              <input className="w-full border rounded px-3 py-2" value={podaci?.grad || ''} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Država</label>
              <input className="w-full border rounded px-3 py-2" value={podaci?.drzava || ''} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">{t.telefon}</label>
              <input className="w-full border rounded px-3 py-2" value={podaci?.telefon || ''} disabled />
            </div>
          </div>
          {/* ...rest of form... */}
        </form>
      </div>
    </ClientLayout>
  );
}