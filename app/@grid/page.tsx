
import { getProizvodi } from '@/lib/actions';
import Image from 'next/image';
import Link from 'next/link';
import OmiljeniButton from '../proizvodi/components/OmiljeniButton';
import sr from '@/i18n/locales/sr/proizvodi.json';
import en from '@/i18n/locales/en/proizvodi.json';
import AddToCartButton from '../proizvodi/components/AddToCartButton';


function getCloudinaryOptimizedUrl(url: string) {
  if (!url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/', '/upload/f_auto,q_auto,w_400,h_400/');
}

export default async function GridPage({ lang = 'sr' }: { lang?: string }) {
  const result = await getProizvodi(1, 12);
  const proizvodi = result.success ? result.data?.proizvodi || [] : [];
  const t = lang === 'en' ? en : sr;

  if (proizvodi.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{t.nema_proizvoda_prikaz || (lang === 'en' ? 'No products to display.' : 'Nema proizvoda za prikaz.')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
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
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 relative"
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
              <h3 className="text-xl font-bold text-center mb-2 text-gray-800">
                {naziv}
              </h3>
              {opis && (
                <p className="text-gray-600 text-center mb-3 text-sm">
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
              <div className="flex gap-2 mb-2 cursor-pointer">
                <AddToCartButton
                  proizvod={proizvod}
                />
                <Link
                  href={`/proizvodi/${proizvod.id}`}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {t.detalji || (lang === 'en' ? 'Details' : 'Detalji')}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
