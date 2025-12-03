/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState, useTransition } from 'react';

import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  getKorpa,
  getPodaciPreuzimanja,
  ocistiKorpu,
  posaljiEmailObavjestenje,
  updateProizvodStanje
} from '@/lib/actions';
import { getProizvodById } from '@/lib/actions/proizvodi';

export default function UspjesnoPlacanjePage() {
  // KorpaContext uklonjen, sve se radi direktno iz baze
  const [isLoading, setIsLoading] = useState(true);
  const [paymentProvider, setPaymentProvider] = useState<'monripay' | 'unknown'>('unknown');
  const [emailError, setEmailError] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Detekcija providera
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('provider') === 'monripay' || urlParams.get('ShoppingCartID') || urlParams.get('Success')) {
      setPaymentProvider('monripay');

      // Proces plaćanja
      const processPaymentSuccess = async () => {
        // Provjera podataka preuzimanja
        if (session?.user?.id) {
          try {
            const result = await getPodaciPreuzimanja(session.user.id);
            if (!result.success || !result.data) {
              // Nema podataka preuzimanja, preusmjeri na formu
              router.push('/podaci-preuzimanja');
              return;
            }
          } catch (error) {
            console.error('Greška pri provjeri podataka preuzimanja:', error);
            // U slučaju greške, preusmjeri na formu
            router.push('/podaci-preuzimanja');
            return;
          }
        }

        console.log('Pokretam obradu uspješnog plaćanja...');
        // console.log('Stavke u korpi:', stavke);

        startTransition(async () => {
          try {
            // 1. Umanji stanje proizvoda u bazi
            // Dohvati stavke iz baze
            const korpaResult = session?.user?.id ? await getKorpa(session.user.id) : { success: false, data: null };
            const stavkeBaza = korpaResult.success && korpaResult.data ? korpaResult.data.stavke : [];
            if (stavkeBaza && stavkeBaza.length > 0) {
              for (const item of stavkeBaza) {
                if (item.proizvod?.id && item.kolicina) {
                  // Dohvati trenutnu količinu iz baze
                  const proizvodRes = await getProizvodById(item.proizvod.id);
                  if (proizvodRes.success && proizvodRes.data) {
                    const novaKolicina = (proizvodRes.data.kolicina ?? 0) - item.kolicina;
                    const result = await updateProizvodStanje(item.proizvod.id, novaKolicina);
                    if (!result.success) {
                      console.error('Greška pri ažuriranju stanja proizvoda:', result.error);
                    }
                  }
                }
              }
            }

            // 2. Pošalji email potvrdu o plaćanju PRE brisanja korpe
            if (session?.user?.email) {
              const korpaResult = await getKorpa(session.user.id);
              const stavkeBaza = korpaResult.success && korpaResult.data ? korpaResult.data.stavke : [];
              const ukupno = stavkeBaza.reduce((acc: number, s: any) => acc + (s.proizvod ? s.proizvod.cena * s.kolicina : 0), 0);
              const emailSent = await posaljiEmailObavjestenje({
                email: session.user.email || '',
                ukupno,
                stavke: stavkeBaza,
                subject: 'Potvrda o plaćanju - Prodavnica',
                text: `Vaša uplata je uspešno obrađena. Ukupno: ${ukupno} €.`,
              });
              if (emailSent) {
                console.log('Email potvrda o plaćanju je poslata');
              } else {
                toast.error('Greška pri slanju email potvrde!');
              }
            }

            // 3. Prazni korpu u bazi
            if (session?.user?.id) {
              const result = await ocistiKorpu(session.user.id);
              if (result.success) {
                console.log('Backend korpa je obrisana');
                // Sinhronizuj frontend korpu sa backendom
                window.dispatchEvent(new Event('korpaChanged'));
              } else {
                console.error('Greška pri brisanju korpe u bazi:', result.error);
              }
            }



            toast.success('Plaćanje je uspešno obrađeno!', { duration: 3000 });

            setIsLoading(false);

            // Redirect to home after showing success


              router.push('/');


          } catch (error) {
            console.error('Greška pri obradi plaćanja:', error);
            setEmailError('Došlo je do greške pri obradi plaćanja');
            setIsLoading(false);
          }
        });
      };

      processPaymentSuccess();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Obrađujem plaćanje...</p>
            {isPending && (
              <p className="text-sm text-blue-600 mt-2">Ažuriram stanje proizvoda...</p>
            )}
          </>
        ) : (
          <>
              <div className="mb-6">
                <div className="flex items-center justify-center mx-auto mb-4">
                  <div className="w-20 h-20 rounded-full bg-linear-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-3xl font-extrabold text-green-700 mb-2 tracking-tight">Plaćanje uspješno!</h1>
                <p className="text-base text-gray-700 mb-4">Vaša porudžbina je obrađena.<br className="hidden sm:inline" /> Hvala na kupovini!</p>
              </div>

            {paymentProvider === 'monripay' && (
                <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-4 flex items-center gap-3">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-700 font-semibold">MonriPay transakcija je uspješno završena.</span>
                </div>
            )}

            {paymentProvider === 'unknown' && (
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-4 flex items-center gap-3">
                  <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                  </svg>
                  <span className="text-yellow-700 font-semibold">Transakcija je završena, ali nije prepoznat provider.</span>
                </div>
            )}

            {emailError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-600">{emailError}</p>
                </div>
            )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <button
                  onClick={() => router.push('/')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Na početnu stranicu
                </button>
                <button
                  onClick={() => router.push('/moje-porudzbine')}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-medium"
                >
                  Moje porudžbine
                </button>
              </div>
          </>
        )}
      </div>
    </div>
  );
}