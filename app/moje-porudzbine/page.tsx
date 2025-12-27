import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { getPorudzbineKorisnika } from '@/lib/actions';
import ClientLayout from '../components/ClientLayout';
import { FaClipboardList, FaBox, FaCalendarAlt, FaEuroSign, FaImage } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
import type { Porudzbina } from '@/types';
import { getLocaleMessages } from '@/lib/i18n';

export default async function MojePorudzbinePage({ searchParams }: { searchParams: Promise<{ page?: string; pageSize?: string; lang?: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/auth/prijava');
  }
  const isLoggedIn = !!session?.user;
  const korisnikIme = typeof session?.user?.name === 'string' ? session.user.name : undefined;
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const pageSize = parseInt(params.pageSize || '10');
  const lang = params.lang === 'en' ? 'en' : 'sr';
  const t = getLocaleMessages(lang, 'moje_porudzbine');
  const result = await getPorudzbineKorisnika(session.user.id, page, pageSize);
  if (!result.success) {
    return (
      <ClientLayout lang={lang} isLoggedIn={isLoggedIn} korisnikIme={korisnikIme}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">Greška pri učitavanju porudžbina</div>
            <p className="text-gray-600">{result.error}</p>
          </div>
        </div>
      </ClientLayout>
    );
  }
  const porudzbine = result.data?.porudzbine || [];
  const total = result.data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  if (!porudzbine.length) {
    return (
      <ClientLayout lang={lang} isLoggedIn={isLoggedIn} korisnikIme={korisnikIme}>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2 text-center justify-center">
              <FaClipboardList className="text-blue-600" />
              {t.moje_porudzbine || 'Moje porudžbine'}
            </h1>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FaBox className="text-6xl text-gray-300 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-600 mb-2">
                {t.nemate_porudzbina || 'Nemate porudžbina'}
              </h2>
              <p className="text-gray-500 mb-6">
                {t.kada_napravite_porudzbinu || 'Kada napravite porudžbinu, pojaviće se ovde.'}
              </p>
              <Link
                href="/proizvodi"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t.pocni_kupovinu || 'Počni kupovinu'}
              </Link>
            </div>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout lang={lang} isLoggedIn={isLoggedIn} korisnikIme={korisnikIme}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2 text-center justify-center">
            <FaClipboardList className="text-blue-600" />
            {t.moje_porudzbine || 'Moje porudžbine'}
          </h1>

          <div className="space-y-6">
            {porudzbine.map((porudzbina: Porudzbina) => (
              <div key={porudzbina.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <FaClipboardList className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {t.porudzbina} #{porudzbina.id.slice(-8)}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <FaCalendarAlt />
                            {new Date(porudzbina.kreiran).toLocaleDateString(lang === 'en' ? 'en-US' : 'sr-RS')}
                          </div>
                          <div className="flex items-center gap-1">
                            <FaEuroSign />
                            {porudzbina.ukupno.toFixed(2)} €
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${porudzbina.status === 'Završeno'
                        ? 'bg-green-100 text-green-800'
                        : porudzbina.status === 'Na čekanju'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}>
                        {porudzbina.status === 'Završeno'
                          ? t.status_zavrseno || 'Završeno'
                          : porudzbina.status === 'Na čekanju'
                            ? t.status_na_cekanju || 'Na čekanju'
                            : porudzbina.status === 'Otkazano'
                              ? t.status_otkazano || 'Otkazano'
                              : porudzbina.status}
                      </span>
                    </div>
                  </div>

                  {/* Stavke porudžbine */}
                  {porudzbina.stavkePorudzbine && porudzbina.stavkePorudzbine.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">{t.stavke}:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {porudzbina.stavkePorudzbine.map((stavka) => (
                          <div key={stavka.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              {stavka.slika ? (
                                <Image
                                  src={stavka.slika}
                                  alt={stavka.proizvod ? (lang === 'en' ? stavka.proizvod.naziv_en : stavka.proizvod.naziv_sr) : 'Proizvod'}
                                  width={48}
                                  height={48}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                              ) : (
                                <FaImage className="text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {stavka.proizvod ? (lang === 'en' ? stavka.proizvod.naziv_en : stavka.proizvod.naziv_sr) : t.nepoznat_proizvod}
                              </p>
                              <p className="text-xs text-gray-500">
                                {stavka.kolicina}x • {stavka.cena.toFixed(2)} €
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Paginacija */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={`/moje-porudzbine?page=${page - 1}&pageSize=${pageSize}&lang=${lang}`}
                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {t.prethodna}
                </Link>
              )}

              <span className="px-3 py-2 text-sm text-gray-700">
                {t.stranica} {page} {t.od} {totalPages}
              </span>

              {page < totalPages && (
                <Link
                  href={`/moje-porudzbine?page=${page + 1}&pageSize=${pageSize}&lang=${lang}`}
                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {t.sledeca}
                </Link>
              )}
            </div>
          )}

          {/* Info o ukupnom broju */}
          <div className="mt-4 text-center text-sm text-gray-600">
            {t.ukupno_porudzbina}: {total}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}