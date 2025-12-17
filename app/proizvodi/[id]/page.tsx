
import { notFound } from 'next/navigation';
import { getProizvodById } from './../../../lib/actions/proizvodi';
import Image from 'next/image';
import fs from 'fs';
import path from 'path';

function getLocaleMessages(lang: string) {
  const filePath = path.join(process.cwd(), 'i18n/locales', lang, 'proizvodi.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

export default async function ProizvodPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ lang?: string }> }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const lang = resolvedSearchParams?.lang || 'sr';
  const t = getLocaleMessages(lang);
  const result = await getProizvodById(resolvedParams.id);
  if (!result.success || !result.data) notFound();
  const proizvod = result.data;

  const naziv = lang === 'en' ? proizvod.naziv_en : proizvod.naziv_sr;
  const opis = lang === 'en' ? proizvod.opis_en : proizvod.opis_sr;
  const karakteristike = lang === 'en' ? proizvod.karakteristike_en : proizvod.karakteristike_sr;
  const kategorija = lang === 'en' ? proizvod.kategorija_en : proizvod.kategorija_sr;
  const slike: string[] = Array.isArray(proizvod.slike) ? proizvod.slike : [];
  const glavnaSlika = slike[0] || '';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto p-4">
        <a
          href={`/proizvodi?lang=${lang}`}
          className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-700 transition"
        >
          {/* Strelica nazad */}
          <span className="text-lg">←</span>
          {t['nazad'] || 'Nazad na proizvode'}
        </a>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
          <div className="md:flex">
            {/* Slika proizvoda */}
            <div className="md:w-1/2 p-8 flex items-center justify-center">
              {glavnaSlika ? (
                <Image
                  src={glavnaSlika}
                  alt={naziv || 'Slika proizvoda'}
                  width={500}
                  height={400}
                  className="w-full h-auto object-cover rounded-lg shadow-md"
                  unoptimized
                  priority
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">{t['nema_proizvoda_prikaz'] || 'Nema slike'}</span>
                </div>
              )}
            </div>
            {/* Detalji proizvoda */}
            <div className="md:w-1/2 p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{naziv}</h1>
              <div className="mb-6">
                <div className="text-3xl font-bold text-blue-700 mb-2">{proizvod.cena} €</div>
                <div className={`text-sm font-semibold ${proizvod.kolicina === 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {proizvod.kolicina === 0 ? t['nema_dostupnih_proizvoda'] || 'Nema na zalihama' : `${t['kolicina'] || 'Količina'}: ${proizvod.kolicina}`}
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t['opis'] || 'Opis'}:</h3>
                  <p className="text-gray-600">{opis}</p>
                </div>
                {karakteristike && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t['karakteristike'] || 'Karakteristike'}:</h3>
                    <p className="text-gray-600">{karakteristike}</p>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t['kategorija'] || 'Kategorija'}:</h3>
                  <p className="text-gray-600">{kategorija || t['nema_kategorije'] || 'Nema kategorije'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
