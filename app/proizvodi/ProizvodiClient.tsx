/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FaBoxOpen, FaEye } from "react-icons/fa";
import Link from 'next/link';
import Image from 'next/image';

import AddToCartButton from './components/AddToCartButton';
import PaginationControls from './components/PaginationControls';
import SearchInfo from './components/SearchInfo';
import OmiljeniButton from './components/OmiljeniButton';
// import ProizvodiSkeleton from '@/components/ProizvodiSkeleton';

export default function ProizvodiClient({ proizvodi, total, page, pageSize, lang, search }: any) {
  const { t } = useTranslation('proizvodi', { lng: lang });
  const searchParams = useSearchParams();


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center justify-center gap-2 text-center">
          <FaBoxOpen className="text-blue-600" />
          {t('artikli') || 'Artikli'}
        </h1>

        <SearchInfo search={search} resultsCount={total} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {proizvodi.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-12">
              <FaBoxOpen className="text-4xl mx-auto mb-4 opacity-50" />
              <p className="text-lg">
                {search ? t('nema_za_pretragu', { search }) : t('nema_proizvoda')}
              </p>
            </div>
          ) : (
              proizvodi.map((proizvod: any) => {
              const naziv = lang === 'en' ? proizvod.naziv_en : proizvod.naziv_sr;
              const opis = lang === 'en' ? proizvod.opis_en : proizvod.opis_sr;
              const karakteristike = lang === 'en' ? proizvod.karakteristike_en : proizvod.karakteristike_sr;
              const kategorija = lang === 'en' ? proizvod.kategorija_en : proizvod.kategorija_sr;

              return (
                <div
                  key={proizvod.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow relative"
                >

                  <div className="absolute top-3 right-3 z-10">
                    <OmiljeniButton proizvodId={proizvod.id} />
                  </div>

                  <div className="mb-3 flex justify-center">
                    <Image
                      src={proizvod.slika || (Array.isArray(proizvod.slike) && proizvod.slike[0]) || '/placeholder.png'}
                      alt={naziv ?? ''}
                      width={100}
                      height={100}
                      className="object-cover rounded-md"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">{naziv}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{opis}</p>
                    <p className="text-gray-500 text-xs line-clamp-1">{karakteristike}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {t('kategorija')}: {kategorija || t('nema_kategorije')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-bold text-blue-700">{proizvod.cena} €</div>
                      <div className={`text-xs font-medium px-2 py-1 rounded ${proizvod.kolicina === 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {t('kolicina')}: {proizvod.kolicina}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <Link
                      href={`/proizvodi/${proizvod.id}?lang=${lang}`}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <FaEye />
                      {t('detalji')}
                    </Link>
                    <AddToCartButton proizvod={proizvod} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <PaginationControls
          page={page}
          total={total}
          pageSize={pageSize}
          lang={lang}
          search={search}
        />
      </div>
    </div>
  );
}
