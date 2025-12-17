/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getOmiljeni } from '@/lib/actions/omiljeni';
import Image from 'next/image';
import Link from 'next/link';
import { FaHeart, FaEye } from 'react-icons/fa';

import sr from '@/i18n/locales/sr/omiljeni-page.json';
import en from '@/i18n/locales/en/omiljeni-page.json';
import ClientLayout from '../components/ClientLayout';
import { getKorpa } from '@/lib/actions/korpa';
export default async function OmiljeniPage({ searchParams }: { searchParams?: Promise<{ lang?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const lang = params?.lang === 'en' ? 'en' : 'sr';
  const t = lang === 'en' ? en : sr;

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  let omiljeni: any[] = [];
  let brojUKorpi = 0;
  if (userId) {
    const result = await getOmiljeni(userId);
    if (result.success && result.data) {
      omiljeni = Array.isArray(result.data) ? result.data : result.data.omiljeni || [];
    }
    const korpa = await getKorpa(userId);
    if (korpa.success && korpa.data?.stavke) {
      brojUKorpi = korpa.data.stavke.reduce((sum, s) => sum + (s.kolicina || 1), 0);
    }
  }

  const isLoggedIn = !!session?.user;
  const korisnikIme = typeof session?.user?.name === 'string' ? session.user.name : undefined;
  if (!userId) {
    return (
      <ClientLayout lang={lang} isLoggedIn={isLoggedIn} korisnikIme={korisnikIme}>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <FaHeart className="text-gray-300 text-6xl mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            {t.morate_biti_prijavljeni_za_omiljene}
          </h2>
          <Link
            href="/auth/prijava"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t.prijavi_se}
          </Link>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout lang={lang} isLoggedIn={isLoggedIn} korisnikIme={korisnikIme}>
      <>
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center justify-center gap-2 text-center">
          <FaHeart className="text-red-600" />
          {t.omiljeni_proizvodi}
        </h1>
        {omiljeni.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
            <FaHeart className="text-gray-300 text-6xl mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              {t.nema_omiljenih_proizvoda}
            </h2>
            <p className="text-gray-500 mb-4">
              {t.dodajte_u_omiljene_opis}
            </p>
            <Link
              href="/proizvodi"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t.pregled_proizvoda}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 ml-4">
            {omiljeni.map(o => (
              <div
                key={o.id}
                className="bg-white border border-gray-200 rounded-lg flex flex-col shadow-sm hover:shadow-md transition-shadow cursor-pointer relative p-3 pl-4"
              >
                {/* Product image */}
                {o.proizvod.slika && (
                  <div className="mb-3 flex justify-center">
                    <Image
                      src={o.proizvod.slika}
                      alt={lang === 'en' ? o.proizvod.prevodi?.find((p: { jezik: string; }) => p.jezik === 'en')?.naziv : o.proizvod.prevodi?.find((p: { jezik: string; }) => p.jezik === 'sr')?.naziv}
                      width={100}
                      height={100}
                      className="object-cover rounded-md"
                    />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                    {lang === 'en' ? o.proizvod.naziv_en : o.proizvod.naziv_sr}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {lang === 'en' ? o.proizvod.opis_en : o.proizvod.opis_sr}
                  </p>
                  <p className="text-gray-500 text-xs line-clamp-1">
                    {lang === 'en' ? o.proizvod.karakteristike_en : o.proizvod.karakteristike_sr}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {t.kategorija}: {lang === 'en' ? o.proizvod.kategorija_en : o.proizvod.kategorija_sr}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold text-blue-700">{o.proizvod.cena} €</div>
                    <div className={`text-xs font-medium px-2 py-1 rounded ${o.proizvod.kolicina === 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                      {t.kolicina}: {o.proizvod.kolicina}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <Link
                      href={`/proizvodi/${o.proizvod.id}?lang=${lang}`}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <FaEye />
                      {t.detalji}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    </ClientLayout>
  );
}