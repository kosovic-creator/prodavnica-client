'use client';

import { useTransition } from 'react';
import { useCart } from '../../components/CartContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FaTrashAlt, FaShoppingCart, FaCreditCard } from 'react-icons/fa';
import {
  ocistiKorpu,
  kreirajPorudzbinu,
  getPodaciPreuzimanja
} from '../../../lib/actions';
import { createMonriPayCheckout } from '../../../lib/actions/payment';
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
        toast.error(t.error || 'Greška pri brisanju korpe');
      }
    });
  };

  const potvrdiPorudzbinu = async (): Promise<{ success: boolean; ukupno?: number }> => {
    console.log('[KorpaActions] Email koji se šalje:', session?.user?.email);
    return new Promise<{ success: boolean; ukupno?: number }>((resolve) => {
      startTransition(async () => {
        try {
          console.log('[KorpaActions] Kreiranje porudžbine...');
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
          console.log('[KorpaActions] Rezultat kreiranja porudžbine:', result);

          if (!result.success) {
            toast.error(result.error || t.error || 'Greška pri kreiranju porudžbine');
            resolve({ success: false });
            return;
          }

          resolve({ success: true, ukupno });
        } catch (error) {
          console.error('[KorpaActions] Error creating order:', error);
          toast.error(t.error || 'Greška pri kreiranju porudžbine');
          resolve({ success: false });
        }
      });
    });
  };

  const handleZavrsiKupovinu = async () => {
    startTransition(async () => {
      try {
        console.log('[KorpaActions] Pokrenut završetak kupovine');
        // Check delivery data
        const podaciResult = await getPodaciPreuzimanja(userId);
        console.log('[KorpaActions] Podaci za preuzimanje:', podaciResult);

        if (!podaciResult.success || !podaciResult.data) {
          toast.error(t.no_data_redirect || "Nemate unete podatke za preuzimanje. Bićete preusmereni na stranicu za unos podataka.", { duration: 5000 });
          setTimeout(() => {
            router.push('/podaci-preuzimanja');
          }, 2000);
          return;
        }

        // Create order
        const result = await potvrdiPorudzbinu();
        console.log('[KorpaActions] Rezultat potvrde porudžbine:', result);
        if (result.success) {
          await isprazniKorpu();
          // Poziv za email obavještenje o porudžbini
          console.log('[KorpaActions] Slanje email obavještenja...');
          const emailResult = await posaljiEmailObavjestenje({
            email: session?.user?.email || '',
            ukupno,
            tip: 'porudzbina',
            stavke: stavke
          });
          console.log('[KorpaActions] Rezultat slanja email-a:', emailResult);
          console.log('[KorpaActions] Porudžbina uspešno kreirana i korpa ispražnjena.');
          router.push('/');
        }
      } catch (error) {
        console.error('[KorpaActions] Error completing purchase:', error);
        toast.error(t.error || 'Greška pri završavanju kupovine');
      }
    });
  };

  const handleMontrypayCheckout = async () => {
    try {
      console.log('[KorpaActions] Pokrenut Montrypay checkout');
      const podaciResult = await getPodaciPreuzimanja(userId);
      console.log('[KorpaActions] Podaci za preuzimanje:', podaciResult);

      if (!podaciResult.success || !podaciResult.data) {
        toast.error(t.no_data_redirect || "Nemate unete podatke za preuzimanje. Bićete preusmereni na stranicu za unos podataka.", { duration: 5000 });
        setTimeout(() => {
          router.push('/podaci-preuzimanja');
        }, 2000);
        return;
      }

      console.log('[KorpaActions] Kreiranje porudžbine za Montrypay...');
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
      console.log('[KorpaActions] Rezultat kreiranja porudžbine za Montrypay:', result);

      if (result.success) {
        // Kreiraj MonriPay checkout sesiju
        const paymentResult = await createMonriPayCheckout(ukupno);
        console.log('[KorpaActions] MonriPay checkout rezultat:', paymentResult);

        if (paymentResult.success && paymentResult.redirectUrl) {
          router.push(paymentResult.redirectUrl);
        } else {
          toast.error(paymentResult.error || 'Greška pri kreiranju MonriPay sesije');
        }
      } else {
        toast.error(result.error || 'Greška pri kreiranju porudžbine');
      }
    } catch (error) {
      console.error('[KorpaActions] Error during Montrypay checkout:', error);
      toast.error(t.error || 'Greška pri Montrypay plaćanju');
    }
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
          onClick={handleMontrypayCheckout}
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <FaCreditCard />
          )}
          {t.montrypay || 'Montrypay'}
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