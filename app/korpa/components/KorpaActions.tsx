'use client';

import { useTransition } from 'react';
import { useCart } from '../../components/CartContext';
// SSR lokalizacija: primaj lang i t kao prop
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FaTrashAlt, FaShoppingCart } from 'react-icons/fa';
import {
  ocistiKorpu,
  kreirajPorudzbinu,
  getPodaciPreuzimanja
} from '../../../lib/actions';
import { posaljiEmailObavjestenje } from '../../../lib/actions/email';
import { getProizvodById, updateProizvodStanje } from '../../../lib/actions/proizvodi';
import { useSession } from 'next-auth/react';


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
  lang: string;
  t: Record<string, string>;
}

export default function KorpaActions({ userId, stavke, lang, t }: KorpaActionsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { data: session } = useSession();

  const ukupno = stavke.reduce((acc, s) => acc + (s.proizvod ? s.proizvod.cena * s.kolicina : 0), 0);

  const { refreshKorpa } = useCart();
  const isprazniKorpu = async () => {
    startTransition(async () => {
      try {
        // Smanji stanje proizvoda za svaku stavku u korpi
        for (const item of stavke) {
          if (item.proizvod?.id && item.kolicina) {
            const proizvodRes = await getProizvodById(item.proizvod.id);
            if (proizvodRes.success && proizvodRes.data) {
              const novaKolicina = (proizvodRes.data.kolicina ?? 0) - item.kolicina;
              await updateProizvodStanje(item.proizvod.id, novaKolicina);
            }
          }
        }

        const result = await ocistiKorpu(userId);

        if (!result.success) {
          toast.error(result.error || 'Greška pri brisanju korpe');
          return;
        }

        await refreshKorpa();
        window.location.reload();
        console.log('Korpa je ispražnjena i stanje proizvoda smanjeno');
      } catch (error) {
        console.error('Greška pri brisanju korpe ili ažuriranju stanja proizvoda:', error);
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
            email: session?.user?.email || '',
            stavke: stavke.map(s => ({
              proizvodId: s.proizvod?.id || '',
              kolicina: s.kolicina,
              cena: s.proizvod?.cena || 0,
              slika: s.proizvod?.slika || undefined
            })),
          };

          const result = await kreirajPorudzbinu(porudzbinaData);

          if (!result.success) {
            toast.error(result.error || t.error || 'Greška pri kreiranju porudžbine');
            resolve(false);
            return;
          }

          await isprazniKorpu();
          // Poziv za email obavještenje o porudžbini
          await posaljiEmailObavjestenje({
            email: result.data?.email || '',
            ukupno,
            tip: 'porudzbina',
            stavke: stavke
          });
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
          toast.error(t.no_data_redirect || "Nemate unete podatke za preuzimanje. Bićete preusmereni na stranicu za unos podataka.", { duration: 5000 });
          setTimeout(() => {
            router.push('/');
          }, 2000);
          return;
        }

        // Create order
        const success = await potvrdiPorudzbinu();
        if (success) {
          console.log('Porudžbina uspešno kreirana i korpa ispražnjena.');
          router.push('/');
        }
      } catch (error) {
        console.error('Error completing purchase:', error);
        toast.error(t.error || 'Greška pri završavanju kupovine');
      }
    });
  };

  if (!stavke.length) return null;

  return (
    <div className="space-y-4">
      {/* Ukupno */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>{t.ukupno || 'Ukupno'}:</span>
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
          {t.isprazni_korpu || 'Isprazni korpu'}
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
          {t.zavrsi_kupovinu || 'Završi kupovinu'}
        </button>
      </div>
    </div>
  );
}