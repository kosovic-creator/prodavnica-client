
import Image from 'next/image';
import Link from 'next/link';
import { getProizvodi } from '@/lib/actions/proizvodi';
import { getCloudinaryOptimizedUrl } from '@/lib/cloudinary';
import OmiljeniButton from '../proizvodi/components/OmiljeniButton';
import sr from '@/i18n/locales/sr/proizvodi-page.json';
import en from '@/i18n/locales/en/proizvodi-page.json';
import AddToCartButton from '../proizvodi/components/AddToCartButton';

export default async function GridPage({ lang = 'sr' }: { lang?: string }) {
  const result = await getProizvodi(1, 12);
  const proizvodi = result.success ? result.data?.proizvodi || [] : [];
  const t = lang === 'en' ? en : sr;

  if (proizvodi.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-white min-h-screen flex items-center justify-center">
        <div className="text-center bg-white text-gray-900 rounded-lg shadow p-8">
          <p className="text-lg">{t.nema_proizvoda_prikaz || (lang === 'en' ? 'No products to display.' : 'Nema proizvoda za prikaz.')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-900">
          {t.our_products || (lang === 'en' ? 'Our Products' : 'Naši proizvodi')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proizvodi.map((proizvod) => {
            const imageUrl = Array.isArray(proizvod.slike) && proizvod.slike.length > 0
              ? getCloudinaryOptimizedUrl(proizvod.slike[0])
              : null;
            const naziv = lang === 'en' ? proizvod.naziv_en : proizvod.naziv_sr;
            const opis = lang === 'en' ? proizvod.opis_en : proizvod.opis_sr;
            const karakteristike = lang === 'en' ? proizvod.karakteristike_en : proizvod.karakteristike_sr;
            const kategorija = lang === 'en' ? proizvod.kategorija_en : proizvod.kategorija_sr;
            return (
              <div
                key={proizvod.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 relative text-gray-900 dark:text-gray-900"
              >
                {/* Omiljeni button in top-right corner */}
                <div className="absolute top-3 right-3 z-10">
                  <OmiljeniButton proizvodId={proizvod.id} />
                </div>
                <div className="flex justify-center mb-4">
                  {imageUrl ? (
                    <div className="relative w-24 h-24">
                      <Image
                        src={imageUrl}
                        alt={naziv || 'Proizvod'}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 96px"
                        quality={90}
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-linear-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-4xl">
                        {lang === 'en'
                          ? (proizvod.kategorija_en === 'bike' ? '🚴' : proizvod.kategorija_en === 'shoes' ? '👟' : '📦')
                          : (proizvod.kategorija_sr === 'bicikla' ? '🚴' : proizvod.kategorija_sr === 'patike' ? '👟' : '📦')}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-center mb-2 text-gray-900 dark:text-gray-900">
                  {naziv}
                </h3>
                {opis && (
                  <p className="text-gray-600 dark:text-gray-700 text-center mb-3 text-sm">
                    {opis}
                  </p>
                )}
                {karakteristike && (
                  <p className="text-gray-500 text-center mb-3 text-sm">
                    {karakteristike}
                  </p>
                )}
                {kategorija && (
                  <p className="text-center mb-4">
                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {t.kategorija}: {kategorija}
                    </span>
                  </p>
                )}
                <p className="text-center mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    {proizvod.cena} €
                  </span>
                </p>
                {proizvod.kolicina !== undefined && (
                  <p className="text-center mb-4 text-sm">
                    <span className={`px-2 py-1 rounded ${proizvod.kolicina === 0 ? 'bg-red-100 text-red-600 font-bold' : 'bg-gray-100 text-gray-500'}`}>
                      {t.kolicina}: {proizvod.kolicina}
                    </span>
                  </p>
                )}
                <div className="flex gap-2 mb-2">
                  <AddToCartButton
                    proizvod={{
                      ...proizvod,
                      naziv,
                      opis: opis ?? '',
                      kategorija,
                      opis_sr: proizvod.opis_sr ?? undefined,
                      opis_en: proizvod.opis_en ?? undefined,
                      karakteristike_sr: proizvod.karakteristike_sr ?? undefined,
                      karakteristike_en: proizvod.karakteristike_en ?? undefined,
                    }}
                  />
                  <Link
                    href={`/proizvodi/${proizvod.id}`}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    {t.detalji || (lang === 'en' ? 'Details' : 'Detalji')}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
