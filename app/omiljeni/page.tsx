'use client';

import { Suspense, useState, useEffect, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { Omiljeni } from '@/types';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { FaCartPlus, FaEye, FaHeart, FaMinus } from "react-icons/fa";
import '@/i18n/config';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

import { getOmiljeni, ukloniIzOmiljenih } from '@/lib/actions/omiljeni';
import { dodajUKorpu, getKorpa } from '@/lib/actions/korpa';

export default function OmiljeniPage() {
  return (
    <Suspense fallback={<div>Učitavanje...</div>}>
      <OmiljeniContent />
    </Suspense>
  );
}

function OmiljeniContent() {
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') || 'sr';
  const { t } = useTranslation('omiljeni_page', { lng: lang });
  const { data: session } = useSession();
  const [omiljeni, setOmiljeni] = useState<Omiljeni[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Helper function za prikaz polja prema jeziku
  const getField = (
    proizvod: Omiljeni["proizvod"],
    field: 'naziv' | 'opis' | 'karakteristike' | 'kategorija'
  ) => {
    const prevod = proizvod.prevodi?.find(p => p.jezik === lang);
    return prevod ? prevod[field] : '';
  };

  useEffect(() => {
    const loadOmiljeni = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const result = await getOmiljeni(session.user.id);
        if (result.success && result.data) {
          setOmiljeni(Array.isArray(result.data) ? result.data : result.data.omiljeni || []);
        } else {
          toast.error(result.error || 'Greška pri učitavanju omiljenih');
          setOmiljeni([]);
        }
      } catch (error) {
        console.error('Error loading omiljeni:', error);
        toast.error('Greška pri učitavanju omiljenih');
        setOmiljeni([]);
      } finally {
        setLoading(false);
      }
    };
    loadOmiljeni();
  }, [session?.user?.id, lang]);

  const handleProizvodClick = (proizvodId: string) => {
    router.push(`/proizvodi/${proizvodId}?lang=${lang}`);
  };

  const handleDodajUKorpu = async (omiljeni: Omiljeni) => {
    const korisnikId = session?.user?.id;
    if (!korisnikId) {
      toast.error(
        <span>
          {t('morate_biti_prijavljeni_za_korpu')}{' '}
          <a href="/auth/prijava" className="underline text-blue-600 ml-2">{t('prijavi_se')}</a>
        </span>
      );
      return;
    }
    startTransition(async () => {
      try {
        const result = await dodajUKorpu({
          korisnikId,
          proizvodId: omiljeni.proizvodId,
          kolicina: 1
        });
        if (result.success) {
          toast.success(t('dodato_u_korpu'));
          const korpaResult = await getKorpa(korisnikId);
          if (korpaResult.success && korpaResult.data) {
            const broj = korpaResult.data.stavke.reduce((acc: number, s: { kolicina: number }) => acc + s.kolicina, 0);
            localStorage.setItem('brojUKorpi', broj.toString());
            window.dispatchEvent(new Event('korpaChanged'));
          }
        } else {
          toast.error(result.error || 'Greška pri dodavanju u korpu');
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
        toast.error('Greška pri dodavanju u korpu');
      }
    });
  };

  const handleUkloniOmiljeni = async (omiljeni: Omiljeni) => {
    const korisnikId = session?.user?.id;
    if (!korisnikId) {
      toast.error(
        <span>
          {t('morate_biti_prijavljeni_za_omiljene')}{' '}
          <a href="/auth/prijava" className="underline text-blue-600 ml-2">{t('prijavi_se')}</a>
        </span>
      );
      return;
    }
    startTransition(async () => {
      try {
        const result = await ukloniIzOmiljenih(korisnikId, omiljeni.proizvodId);
        if (result.success) {
          setOmiljeni(prevOmiljeni => prevOmiljeni.filter(o => o.id !== omiljeni.id));
          toast.success(result.message || t('uklonjen_iz_omiljenih'));
        } else {
          toast.error(result.error || `${t('greska')}: ${t('neuspesno_uklanjanje')}`);
        }
      } catch (error) {
        console.error('Error removing from omiljeni:', error);
        toast.error(t('greska_uklanjanje_omiljeni'));
      }
    });
  };

  if (!session?.user?.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <FaHeart className="text-gray-300 text-6xl mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">
          {t('morate_biti_prijavljeni_za_omiljene')}
        </h2>
        <Link
          href="/auth/prijava"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('prijavi_se')}
        </Link>
      </div>
    );
  }

  return (
    loading ? (
      <div className="space-y-4">
        {/* <Loading /> */}
      </div>
    ) : (
        <>
        <Toaster position="top-center" />
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center justify-center gap-2 text-center">
          <FaHeart className="text-red-600" />
          {t('omiljeni_proizvodi')}
          </h1>
        {omiljeni.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
            <FaHeart className="text-gray-300 text-6xl mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
                {t('nema_omiljenih_proizvoda')}
            </h2>
            <p className="text-gray-500 mb-4">
                {t('dodajte_u_omiljene_opis')}
            </p>
            <Link
              href="/proizvodi"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
                {t('pregled_proizvoda')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 ml-4">
            {omiljeni.map(o => (
              <div
                key={o.id}
                className="bg-white border border-gray-200 rounded-lg flex flex-col shadow-sm hover:shadow-md transition-shadow cursor-pointer relative p-3 pl-4"
                onClick={() => handleProizvodClick(o.proizvodId)}
              >
                {/* Remove button */}
                <div className="absolute top-3 right-3 z-10">
                  <button
                    onClick={e => { e.stopPropagation(); handleUkloniOmiljeni(o); }}
                    className="w-8 h-8 rounded-full bg-red-100 text-black hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center justify-center"
                    title={t('ukloni_iz_omiljenih')}
                    disabled={isPending}
                  >
                    <FaMinus />
                  </button>
                </div>
                {/* Product image */}
                {o.proizvod.slika && (
                  <div className="mb-3 flex justify-center">
                    <Image
                      src={o.proizvod.slika}
                      alt={getField(o.proizvod, 'naziv') || ''}
                      width={100}
                      height={100}
                      className="object-cover rounded-md"
                    />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                    {getField(o.proizvod, 'naziv')}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {getField(o.proizvod, 'opis')}
                  </p>
                  <p className="text-gray-500 text-xs line-clamp-1">
                    {getField(o.proizvod, 'karakteristike')}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {t('kategorija')}: {getField(o.proizvod, 'kategorija')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold text-blue-700">{o.proizvod.cena} €</div>
                    <div className={`text-xs font-medium px-2 py-1 rounded ${o.proizvod.kolicina === 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                      {t('kolicina')}: {o.proizvod.kolicina}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <Link
                      href={`/proizvodi/${o.proizvodId}?lang=${lang}`}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <FaEye />
                      {t('detalji')}
                    </Link>
                    <button
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={e => { e.stopPropagation(); handleDodajUKorpu(o); }}
                      disabled={o.proizvod.kolicina === 0 || isPending}
                    >
                      <FaCartPlus />
                      {isPending ? t('dodaje') :
                        o.proizvod.kolicina === 0 ?
                          (t('nema_na_zalihama') || 'Nema na zalihama') :
                          (t('dodaj_u_korpu') || 'Dodaj u korpu')
                      }
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    )
  );
}