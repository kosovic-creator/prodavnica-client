import ClientLayout from '.././components/ClientLayout';
import ProizvodiSkeleton from './components/ProizvodiSkeleton';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getProizvodi } from './../../lib/actions/proizvodi';
import Image from 'next/image';
import AddToCartButton from './components/AddToCartButton';
import OmiljeniButton from './components/OmiljeniButton';
import PaginationControls from './components/PaginationControls';
import fs from 'fs';
import path from 'path';
import type { Proizvodi } from '@/types';

function getLocaleMessages(lang: string) {
  const filePath = path.join(process.cwd(), 'i18n/locales', lang, 'proizvodi.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

export default async function ProizvodiPage({ searchParams }: { searchParams: Promise<{ page?: string; pageSize?: string; lang?: string; search?: string }> }) {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user;
  const korisnikIme = typeof session?.user?.name === 'string' ? session.user.name : undefined;
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const pageSize = parseInt(params.pageSize || '10');
  const lang = params.lang || 'sr';
  const search = params.search || '';

  const t = getLocaleMessages(lang);
  const result = await getProizvodi(page, pageSize, search);
  if (!result.success || !result.data) {
    return (
      <ClientLayout lang={lang} isLoggedIn={isLoggedIn} korisnikIme={korisnikIme} >
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <ProizvodiSkeleton />
          </div>
        </div>
      </ClientLayout>
    );
  }
  const { proizvodi } = result.data;

  return (
    <ClientLayout lang={lang} isLoggedIn={isLoggedIn} korisnikIme={korisnikIme}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center justify-center gap-2 text-center">
            {t['artikli'] || 'Artikli'}
          </h1>
          <Suspense fallback={<ProizvodiSkeleton />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {proizvodi.length === 0 ? (
                <div className="col-span-full text-center text-gray-500 py-12">
                  <p className="text-lg">{search ? t['nema_za_pretragu']?.replace('{search}', search) : t['nema_proizvoda'] || 'Nema proizvoda'}</p>
                </div>
              ) : (
                  proizvodi.map((proizvod: Proizvodi) => {
                  const naziv = lang === 'en' ? proizvod.naziv_en : proizvod.naziv_sr;
                  const opis = lang === 'en' ? proizvod.opis_en : proizvod.opis_sr;
                  const karakteristike = lang === 'en' ? proizvod.karakteristike_en : proizvod.karakteristike_sr;
                  const kategorija = lang === 'en' ? proizvod.kategorija_en : proizvod.kategorija_sr;
                  const glavnaSlika = proizvod.slika || (Array.isArray(proizvod.slike) && proizvod.slike[0]) || '/placeholder.png';
                  return (
                    <div key={proizvod.id} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow relative">
                      <div className="mb-3 flex justify-center">
                        <Image
                          src={glavnaSlika}
                          alt={naziv || 'Slika proizvoda'}
                          width={400}
                          height={300}
                          className="object-contain rounded-lg shadow-lg"
                          unoptimized
                          priority
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">{naziv}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{opis}</p>
                        <p className="text-gray-500 text-xs line-clamp-1">{karakteristike}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">{t['kategorija']}: {kategorija || t['nema_kategorije']}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xl font-bold text-blue-700">{proizvod.cena} €</div>
                          <div className={`text-xs font-medium px-2 py-1 rounded ${proizvod.kolicina === 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>{t['kolicina']}: {proizvod.kolicina}</div>
                        </div>
                      </div>
                      <div className="absolute top-3 right-3 z-10">
                        <OmiljeniButton proizvodId={proizvod.id} />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 mt-4">
                        <a href={`/proizvodi/${proizvod.id}?lang=${lang}`} className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium">
                          {t['detalji']}
                        </a>
                        <AddToCartButton proizvod={proizvod} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Suspense>
          <PaginationControls page={page} total={result.data.total} pageSize={pageSize} lang={lang} search={search} />
        </div>
      </div>
    </ClientLayout>
  );
}