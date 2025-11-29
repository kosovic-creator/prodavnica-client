'use client';

import { useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FaTrashAlt, FaShoppingCart } from 'react-icons/fa';
import {
  ocistiKorpu,
  kreirajPorudzbinu,
  getPodaciPreuzimanja
} from '../../../lib/actions';
import { useKorpa } from '../../components/KorpaContext';

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

interface KorpaActionsProps {
  userId: string;
  stavke: StavkaKorpe[];
  onUpdate: () => void;
}

export default function KorpaActions({ userId, stavke, onUpdate }: KorpaActionsProps) {
  const { t } = useTranslation('korpa');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { resetKorpa } = useKorpa();

  const ukupno = stavke.reduce((acc, s) => acc + (s.proizvod ? s.proizvod.cena * s.kolicina : 0), 0);

  const isprazniKorpu = async () => {
    startTransition(async () => {
      try {
        const result = await ocistiKorpu(userId);

        if (!result.success) {
          toast.error(result.error || 'Greška pri brisanju korpe');
          return;
        }

        resetKorpa();
        localStorage.setItem('brojUKorpi', '0');
        window.dispatchEvent(new Event('korpaChanged'));
        onUpdate();
        toast.success('Korpa je ispražnjena');
      } catch (error) {
        console.error('Greška pri brisanju korpe:', error);
        toast.error(t('error') || 'Greška pri brisanju korpe');
      }
    });
  };

  const potvrdiPorudzbinu = async (): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      startTransition(async () => {
        try {
          const porudzbinaData = {
            korisnikId: userId,
            ukupno,
            status: 'Na čekanju',
            stavke: stavke.map(s => ({
              proizvodId: s.proizvod?.id || '',
              kolicina: s.kolicina,
              cena: s.proizvod?.cena || 0,
              slika: s.proizvod?.slika || undefined
            })),
          };

          const result = await kreirajPorudzbinu(porudzbinaData);

          if (!result.success) {
            toast.error(result.error || t('error') || 'Greška pri kreiranju porudžbine');
            resolve(false);
            return;
          }

          await isprazniKorpu();
          resolve(true);
        } catch (error) {
          console.error('Error creating order:', error);
          toast.error(t('error') || 'Greška pri kreiranju porudžbine');
          resolve(false);
        }
      });
    });
  };

  const handleZavrsiKupovinu = async () => {
    startTransition(async () => {
      try {
        // Check delivery data
        const podaciResult = await getPodaciPreuzimanja(userId);

        if (!podaciResult.success || !podaciResult.data) {
          toast.error(t('no_data_redirect') || "Nemate unete podatke za preuzimanje. Bićete preusmereni na stranicu za unos podataka.", { duration: 5000 });
          setTimeout(() => {
            router.push('/podaci-preuzimanja');
          }, 2000);
          return;
        }

        // Create order
        const success = await potvrdiPorudzbinu();
        if (success) {
          toast.success('Potvrda porudžbine je poslata na email!', { duration: 4000 });
          router.push('/');
        }
      } catch (error) {
        console.error('Error completing purchase:', error);
        toast.error(t('error') || 'Greška pri završavanju kupovine');
      }
    });
  };

  if (!stavke.length) return null;

  return (
    <div className="space-y-4">
      {/* Ukupno */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>{t('ukupno') || 'Ukupno'}:</span>
          <span>{ukupno.toFixed(2)} €</span>
        </div>
      </div>

      {/* Akcije */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={isprazniKorpu}
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <FaTrashAlt />
          )}
          {t('isprazni_korpu') || 'Isprazni korpu'}
        </button>

        <button
          onClick={handleZavrsiKupovinu}
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <FaShoppingCart />
          )}
          {t('zavrsi_kupovinu') || 'Završi kupovinu'}
        </button>
      </div>
    </div>
  );
}