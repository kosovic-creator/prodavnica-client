import { getKorpa } from '@/lib/actions/korpa';
import { posaljiEmailObavjestenje } from '@/lib/actions/email';

/**
 * Utility funkcija za čišćenje korpe i slanje email obavještenja.
 * Poziva se iz bilo koje komponente ili akcije.
 * @param userId string - ID korisnika
 * @param email string - Email korisnika
 * @returns {Promise<{success: boolean, emailSent: boolean}>}
 */
export async function clearCartAndSendEmail(userId: string, email: string) {
  if (!userId || !email) return { success: false, emailSent: false };

  // Dohvati stavke i iznos prije čišćenja
  const korpaRes = await getKorpa(userId);
  let stavke: any[] = [];
  let ukupno = 0;
  if (korpaRes.success && korpaRes.data) {
    stavke = korpaRes.data.stavke;
    ukupno = stavke.reduce((acc, s) => acc + ((s.proizvod?.cena || 0) * s.kolicina), 0);
  }

  // Očisti korpu
  const res = await fetch('/api/korpa/ocisti', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  const success = res.ok;

  // Pošalji email
  let emailSent = false;
  if (success) {
    const emailResult = await posaljiEmailObavjestenje({
      email,
      ukupno,
      tip: 'placanje',
      stavke,
    });
    emailSent = emailResult.success;
  }

  return { success, emailSent };
}
