/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { posaljiEmailObavjestenje } from "@/lib/actions/email";
import { getKorpa } from "@/lib/actions/korpa";

export default function AutoClearCart({ lang, t }: { lang: string; t: Record<string, string> }) {
  const { data: session } = useSession();
  const [status, setStatus] = useState<'pending'|'success'|'error'|null>(null);
  const [emailStatus, setEmailStatus] = useState<'pending'|'success'|'error'|null>(null);
  const [stavke, setStavke] = useState<any[]>([]);
  const [ukupno, setUkupno] = useState<number>(0);

  useEffect(() => {
    async function fetchCartAndClear() {
      if (session?.user?.id && session?.user?.email) {
        // Dohvati stavke i iznos prije čišćenja
        const korpaRes = await getKorpa(session.user.id);
        if (korpaRes.success && korpaRes.data) {
          setStavke(korpaRes.data.stavke);
          const sum = korpaRes.data.stavke.reduce((acc: number, s: any) => acc + ((s.proizvod?.cena || 0) * s.kolicina), 0);
          setUkupno(sum);
        }
        setStatus('pending');
        const res = await fetch("/api/korpa/ocisti", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: session.user.id }),
        });
        if (res.ok) {
          setStatus('success');
          // Slanje email obavještenja
          setEmailStatus('pending');

          // Email adminu o novoj porudžbini
          await posaljiEmailObavjestenje({
            email: session.user.email,
            ukupno,
            tip: 'porudzbina',
            stavke: korpaRes.data ? korpaRes.data.stavke : []
          });

          // Email korisniku - potvrda plaćanja
          const emailResult = await posaljiEmailObavjestenje({
            email: session.user.email,
            ukupno,
            tip: 'placanje',
            stavke: korpaRes.data ? korpaRes.data.stavke : []
          });
          setEmailStatus(emailResult.success ? 'success' : 'error');
        } else {
          setStatus('error');
        }
      }
    }
    fetchCartAndClear();
  }, [session?.user?.id, session?.user?.email, ukupno]);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {status === 'success' && (
        <div className="text-green-600 text-sm text-center my-2">
          <div className="mb-2">{lang === 'en' ? 'Cart successfully cleared.' : 'Korpa je uspješno ispražnjena.'}</div>
          <div className="bg-white rounded-lg shadow p-4 w-full max-w-md mx-auto">
            <h3 className="text-lg font-bold mb-2 text-blue-700">{lang === 'en' ? 'Payment summary' : 'Pregled plaćanja'}</h3>
            <ul className="mb-2 divide-y divide-gray-200">
              {stavke.map((s, idx) => (
                <li key={idx} className="py-2 flex justify-between items-center">
                  <span className="font-medium text-gray-800">{lang === 'en' ? (s.proizvod?.naziv_en || s.proizvod?.naziv_sr || 'Product') : (s.proizvod?.naziv_sr || s.proizvod?.naziv_en || 'Proizvod')}</span>
                  <span className="text-gray-600">x{s.kolicina}</span>
                  <span className="text-blue-600 font-semibold">{(s.proizvod?.cena || 0).toFixed(2)} €</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-semibold text-gray-700">{lang === 'en' ? 'Total:' : 'Ukupno:'}</span>
              <span className="text-xl font-bold text-green-700">{ukupno.toFixed(2)} €</span>
            </div>
          </div>
          {emailStatus === 'pending' && <span>{lang === 'en' ? 'Sending email notification...' : 'Šaljem email obavještenje...'}</span>}
          {emailStatus === 'success' && <span className="text-green-700 block mt-2">{lang === 'en' ? 'Email notification sent.' : 'Email obavještenje je poslato.'}</span>}
          {emailStatus === 'error' && <span className="text-red-600 block mt-2">{lang === 'en' ? 'Error sending email.' : 'Greška pri slanju email-a.'}</span>}
        </div>
      )}
      {status === 'error' && (
        <div className="text-red-600 text-sm text-center my-2">{lang === 'en' ? 'Error clearing cart.' : 'Greška pri čišćenju korpe.'}</div>
      )}
    </div>
  );
}
