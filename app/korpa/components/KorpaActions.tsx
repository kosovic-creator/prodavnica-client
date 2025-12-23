'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { FaTrashAlt, FaCreditCard, FaShoppingCart } from 'react-icons/fa';
import { ocistiKorpu } from '@/lib/actions/korpa';
import { kreirajPorudzbinu } from '@/lib/actions/porudzbine';
import { getPodaciPreuzimanja } from '@/lib/actions/podaci-preuzimanja';
import { posaljiObavestenjePorudzbina } from '@/lib/actions/email';
import { getProizvodById, updateProizvodStanje } from '@/lib/actions/proizvodi';
import { useCart } from '../../components/CartContext';
import SuccessMessage from '@/app/components/SuccessMessage';


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

  t: Record<string, string>;
}

export default function KorpaActions({ userId, stavke, t }: KorpaActionsProps) {
  const [isPending, setIsPending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const { data: session } = useSession();

  const ukupno = stavke.reduce((acc, s) => acc + (s.proizvod ? s.proizvod.cena * s.kolicina : 0), 0);

  const { refreshKorpa } = useCart();

  const isprazniKorpu = async () => {
    setIsPending(true);
    try {
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
      console.log('Korpa je ispražnjena i stanje proizvoda smanjeno');

      // Redirect na proizvodi
      router.push('/proizvodi');
    } catch (error) {
      console.error('Greška pri brisanju korpe ili ažuriranju stanja proizvoda:', error);
      toast.error(t.error || 'Greška pri brisanju korpe');
    } finally {
      setIsPending(false);
    }
  };

  const potvrdiPorudzbinu = async (): Promise<{ success: boolean; ukupno?: number }> => {
    console.log('[KorpaActions] Email koji se šalje:', session?.user?.email);
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
        return { success: false };
      }

      return { success: true, ukupno };
    } catch (error) {
      console.error('[KorpaActions] Error creating order:', error);
      toast.error(t.error || 'Greška pri kreiranju porudžbine');
      return { success: false };
    }
  };

  const handleZavrsiKupovinu = async () => {
    setIsPending(true);
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
        // Prvo smanji stanje i očisti korpu
        for (const item of stavke) {
          if (item.proizvod?.id && item.kolicina) {
            const proizvodRes = await getProizvodById(item.proizvod.id);
            if (proizvodRes.success && proizvodRes.data) {
              const novaKolicina = (proizvodRes.data.kolicina ?? 0) - item.kolicina;
              await updateProizvodStanje(item.proizvod.id, novaKolicina);
            }
          }
        }

        // Poziv za email obavještenje korisniku i adminu
        await posaljiObavestenjePorudzbina({
          korisnikEmail: session?.user?.email || '',
          adminEmail: process.env.EMAIL_USER || '',
          subjectKorisnik: 'Nova porudžbina',
          subjectAdmin: 'Nova porudžbina Adminu',
          tip: 'porudzbina',
          ukupno,
          stavke: stavke.map(s => ({
            naziv: s.proizvod?.naziv_sr || 'Nepoznat proizvod',
            kolicina: s.kolicina,
            cena: s.proizvod?.cena || 0,
          })),
        });

        // Prikaži success obaveštenje
        setSuccessMessage(t.kupovina_uspesna);
        setShowSuccess(true);

        // Očisti korpu i redirect nakon 3 sekunde
        setTimeout(async () => {
          await ocistiKorpu(userId);
          refreshKorpa();
          router.push('/proizvodi');
        }, 3000);
      }
    } catch (error) {
      console.error('[KorpaActions] Error completing purchase:', error);
      toast.error(t.error || 'Greška pri završavanju kupovine');
    } finally {
      setIsPending(false);
    }
  };

  const handleMontrypayPlaćanje = async () => {
    setIsPending(true);
    try {
      console.log('[KorpaActions] Pokrenut Montrypay checkout');
      const podaciResult = await getPodaciPreuzimanja(userId);
      console.log('[KorpaActions] Podaci za preuzimanje:', podaciResult);

      if (!podaciResult.success || !podaciResult.data) {
        toast.error(t.no_data_redirect || "Nemate unete podatke za preuzimanje. Bićete preusmereni na stranicu za unos podataka.", { duration: 5000 });
        setTimeout(() => {
          router.push('/podaci-preuzimanja');
        }, 3000);

        return;
      }

      await posaljiObavestenjePorudzbina({
        korisnikEmail: session?.user?.email || '',
        adminEmail: process.env.EMAIL_USER || '',
        subjectKorisnik: 'Nova porudžbina plaćena putem Montrypay-a',
        subjectAdmin: 'Porudžbina uspešno plaćena putem Montrypay-a', // <-- ispravljeno
        tip: 'placanje',
        ukupno,
        stavke: stavke.map(s => ({
          naziv: s.proizvod?.naziv_sr || 'Nepoznat proizvod',
          kolicina: s.kolicina,
          cena: s.proizvod?.cena || 0,
        })),
      });

      // DODAJ OVO: Smanji stanje proizvoda
      for (const item of stavke) {
        if (item.proizvod?.id && item.kolicina) {
          const proizvodRes = await getProizvodById(item.proizvod.id);
          if (proizvodRes.success && proizvodRes.data) {
            const novaKolicina = (proizvodRes.data.kolicina ?? 0) - item.kolicina;
            await updateProizvodStanje(item.proizvod.id, novaKolicina);
          }
        }
      }
      // Prikaži success obaveštenje
      setSuccessMessage(t.montrypay_success || 'Porudžbina je kreirana!');
      setShowSuccess(true);

      // Očisti korpu i redirect nakon 3 sekunde
      setTimeout(async () => {
        await ocistiKorpu(userId);
        refreshKorpa();
        router.push('/proizvodi');
      }, 3000);
      // } else {
      //   toast.error(result.error || 'Greška pri kreiranju porudžbine');
      // }
    } catch (error) {
      console.error('[KorpaActions] Error during Montrypay checkout:', error);
      toast.error(t.error || 'Greška pri Montrypay plaćanju');
    } finally {
      setIsPending(false);
    }
  };

  // if (!stavke.length && !showSuccess) return null;

  return (
    <>
      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6">
          <SuccessMessage message={successMessage} />
        </div>
      )}
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
            onClick={handleMontrypayPlaćanje}
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
    </>
  );
}