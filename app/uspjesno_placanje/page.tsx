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
              // Dohvati podatke iz baze
              const korpaResult = await import('@/lib/actions/korpa').then(mod => mod.getKorpa(session.user.id));
              const stavkeBaza = korpaResult.success && korpaResult.data ? korpaResult.data.stavke : [];
              const ukupno = stavkeBaza.reduce((acc: number, s: any) => acc + (s.proizvod ? s.proizvod.cena * s.kolicina : 0), 0);
              let proizvodiHtml = '';
              if (stavkeBaza && stavkeBaza.length > 0) {
                proizvodiHtml = `<ul style=\"padding-left:0; margin-bottom:16px;\">` +
                  stavkeBaza.map((s: any) =>
                    `<li style='list-style:none; margin-bottom:8px; border-bottom:1px solid #eee; padding-bottom:8px;'>
                      <span style='font-weight:bold;'>${s.proizvod?.naziv_sr || s.proizvod?.naziv_en || 'Proizvod'}</span> &times; ${s.kolicina} <span style='color:#888;'>(${s.proizvod?.cena} €)</span>
                    </li>`
                  ).join('') + '</ul>';
              }
              const html = `
                <div style=\"font-family: Arial, sans-serif; background: #f9f9f9; padding: 32px; border-radius: 12px; color: #222;\">
                  <div style=\"text-align:center; margin-bottom:24px;\">
                    <h2 style=\"color:#2196f3; margin-bottom:8px;\">Hvala na kupovini!</h2>
                    <img src='https://cdn-icons-png.flaticon.com/512/833/833472.png' alt='Potvrda' width='64' style='margin-bottom:16px;' />
                  </div>
                  <div style=\"background:#fff; padding:24px; border-radius:8px; box-shadow:0 2px 8px #eee;\">
                    <p style=\"font-size:18px; margin-bottom:12px;\">Vaša uplata je uspešno obrađena.</p>
                    <p style=\"font-size:16px; margin-bottom:8px;\">Ukupan iznos: <span style=\"color:#2196f3; font-weight:bold;\">${ukupno} €</span></p>
                    ${proizvodiHtml ? `<div style=\"margin-top:16px;\"><h3 style=\"font-size:15px; color:#333; margin-bottom:8px;\">Proizvodi:</h3>${proizvodiHtml}</div>` : ''}
                    <p style=\"font-size:15px; color:#555;\">Uskoro ćete dobiti više informacija o isporuci na ovaj email.</p>
                  </div>
                  <div style=\"text-align:center; margin-top:24px; font-size:13px; color:#888;\">
                    <p>Prodavnica &copy; 2025</p>
                  </div>
                </div>
              `;
              const emailSent = await import('@/lib/actions/email').then(mod => mod.posaljiEmailObavjestenje({
                email: session.user.email || '',
                ukupno,
                stavke: stavkeBaza,
                subject: 'Potvrda o plaćanju - Prodavnica',
                text: `Vaša uplata je uspešno obrađena. Ukupno: ${ukupno} €.`,
                html
              }));
              if (emailSent) {
                // toast.success('Email potvrda o plaćanju je poslata!', { duration: 3000 });
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
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-green-600 mb-2">Plaćanje uspješno!</h1>
                <p className="text-gray-600 mb-4">Vaša porudžbina je obrađena. Hvala na kupovini!</p>
              </div>

            {paymentProvider === 'monripay' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-green-600 font-medium">MonriPay transakcija je uspješno završena.</p>
                </div>
            )}

            {paymentProvider === 'unknown' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-yellow-600">Transakcija je završena, ali nije prepoznat provider.</p>
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