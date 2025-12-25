
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getKorpa } from '@/lib/actions/korpa';
import Link from 'next/link';
import KorpaItem from './components/KorpaItem';
import KorpaActions from './components/KorpaActions';
import ClientLayout from '../components/ClientLayout';
import { getLocaleMessages } from '@/lib/i18n';

export default async function KorpaPage({ searchParams }: { searchParams?: Promise<{ lang?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const lang = params?.lang === 'en' ? 'en' : 'sr';
  const t = getLocaleMessages(lang, 'korpa');
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  let stavke: any[] = [];
  if (userId) {
    const result = await getKorpa(userId);
    if (result.success && result.data) {
      stavke = result.data.stavke || [];
    }
  }

  if (!userId) {
    return (
      <ClientLayout lang={lang} isLoggedIn={false} korisnikIme={undefined}>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            {t.morate_biti_prijavljeni}
          </h2>
          <Link
            href="/auth/prijava"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t.prijava}
          </Link>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout lang={lang} isLoggedIn={!!session?.user} korisnikIme={typeof session?.user?.name === 'string' ? session.user.name : undefined}>

      <>
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center justify-center gap-2 text-center">
          {t.naslov}
        </h1>
        {stavke.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              {t.prazna_korpa}
            </h2>
            <p className="text-gray-500 mb-4">
              {t.nema_proizvoda}
            </p>
            <Link
              href={`/proizvodi?lang=${lang}`}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t.nastavi_kupovinu}
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 ml-4">
              {stavke.map((stavka) => (
                <KorpaItem key={stavka.id} stavka={stavka} lang={lang} t={t} />
              ))}
            </div>
            <div className="mt-8">
              <KorpaActions userId={userId} stavke={stavke} t={t} />
            </div>
            <div className="mt-8">
              {/* Prikaz MonriPay dugmeta za checkout */}

            </div>
          </>
        )}
      </>
    </ClientLayout>
  );
}