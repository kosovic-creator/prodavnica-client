/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getKorpa } from '@/lib/actions/korpa';
import Link from 'next/link';
import Image from 'next/image';
import sr from '@/i18n/locales/sr/korpa.json';
import en from '@/i18n/locales/en/korpa.json';

export default async function KorpaPage({ searchParams }: { searchParams?: Promise<{ lang?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const lang = params?.lang === 'en' ? 'en' : 'sr';
  const t = lang === 'en' ? en : sr;

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
    );
  }

  return (
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
            href="/proizvodi"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t.nastavi_kupovinu}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 ml-4">
          {stavke.map(stavka => (
            <div
              key={stavka.id}
              className="bg-white border border-gray-200 rounded-lg flex flex-col shadow-sm hover:shadow-md transition-shadow cursor-pointer relative p-3 pl-4"
            >
              {/* Product image */}
              {stavka.proizvod?.slika && (
                <div className="mb-3 flex justify-center">
                  <Image
                    src={stavka.proizvod.slika}
                    alt={lang === 'en' ? stavka.proizvod.naziv_en : stavka.proizvod.naziv_sr}
                    width={100}
                    height={100}
                    className="object-cover rounded-md"
                  />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                  {lang === 'en' ? stavka.proizvod.naziv_en : stavka.proizvod.naziv_sr}
                </h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {t.cena}: {stavka.proizvod.cena} €
                  </span>
                  <span className="text-gray-500">
                    {t.kolicina}: {stavka.kolicina}
                  </span>
                </div>
                <Link
                  href={`/proizvodi/${stavka.proizvod.id}?lang=${lang}`}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium mt-2"
                >
                  {lang === 'en' ? 'Details' : 'Detalji'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}