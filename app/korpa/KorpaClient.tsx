"use client";
import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FaShoppingCart } from 'react-icons/fa';
import { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { getKorpa } from '@/lib/actions';
import { useKorpa } from '../components/KorpaContext';
import KorpaItem from './components/KorpaItem';
import KorpaActions from './components/KorpaActions';
import PaymentSelector from '../components/PaymentSelector';

interface StavkaKorpe {
  id: string;
  kolicina: number;
  proizvod?: {
    id: string;
    naziv_sr: string;
    naziv_en: string;
    cena: number;
    slika?: string | null;
  } | null;
}

interface KorpaClientProps {
  lang: string;
}

export default function KorpaClient({ lang }: KorpaClientProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation('korpa', { lng: lang });
  const [stavke, setStavke] = useState<StavkaKorpe[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { resetKorpa } = useKorpa();

  // Load initial cart data
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.id) {
      router.push('/auth/prijava');
      return;
    }
    const loadKorpa = async () => {
      try {
        const result = await getKorpa(session.user.id);
        if (result.success && result.data) {
          setStavke(result.data.stavke);
        }
      } catch (error) {
        console.error('Error loading korpa:', error);
      } finally {
        setLoading(false);
      }
    };
    loadKorpa();
  }, [session, status, router]);

  const refreshKorpa = useCallback(async () => {
    if (!session?.user?.id) return;
    setIsRefreshing(true);
    try {
      const result = await getKorpa(session.user.id);
      if (result.success && result.data) {
        setStavke(result.data.stavke);
        const broj = result.data.stavke.reduce((acc: number, s: StavkaKorpe) => acc + s.kolicina, 0);
        resetKorpa();
        localStorage.setItem('brojUKorpi', broj.toString());
        window.dispatchEvent(new Event('korpaChanged'));
      }
    } catch (error) {
      console.error('Error refreshing korpa:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [session?.user?.id, resetKorpa]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (!stavke.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <Toaster position="top-right" />
        <FaShoppingCart className="text-6xl text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-600 mb-2">
          {t('prazna_korpa') || 'Vaša korpa je prazna'}
        </h2>
        <p className="text-gray-500 mb-6">
          {t('dodajte_proizvode') || 'Dodajte proizvode u korpu da biste nastavili sa kupovinom'}
        </p>
        <Link
          href="/proizvodi"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('nastavi_kupovinu') || 'Nastavi kupovinu'}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <FaShoppingCart className="text-blue-600" />
          {t('naslov') || 'Korpa'}
          {isRefreshing && (
            <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full" />
          )}
        </h1>
        {/* Lista stavki */}
        <div className="space-y-4 mb-8">
          {stavke.map((stavka) => (
            <KorpaItem
              key={stavka.id}
              stavka={stavka}
              onUpdate={refreshKorpa}
            />
          ))}
        </div>
        {/* Payment Selector */}
        <div className="mb-8">
          <PaymentSelector amount={stavke.reduce((acc, s) => acc + (s.proizvod ? s.proizvod.cena * s.kolicina : 0), 0)} />
        </div>
        {/* Akcije */}
        <KorpaActions
          userId={session.user.id}
          stavke={stavke}
          onUpdate={refreshKorpa}
        />
        {/* Continue Shopping Link */}
        <div className="mt-8 text-center">
          <Link
            href="/proizvodi"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            ← {t('nastavi_kupovinu') || 'Nastavi kupovinu'}
          </Link>
        </div>
      </div>
    </div>
  );
}
