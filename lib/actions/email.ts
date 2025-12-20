'use server';

import nodemailer from 'nodemailer';

interface EmailData {
  email: string;
  ukupno: number;
  tip: 'porudzbina' | 'kontakt';
  stavke?: Array<{
    proizvod?: {
      naziv_sr: string;
      naziv_en: string;
      cena: number;
    } | null;
    kolicina: number;
  }>;
  ime?: string;
  poruka?: string;
}

export async function posaljiEmailObavjestenje(data: EmailData) {
  try {
    console.log('[Email] Pokušaj slanja email-a za:', data.email);
    console.log('[Email] Tip:', data.tip);
    console.log('[Email] Stavke:', data.stavke);

    // Proveri da li postoje environment varijable
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('[Email] Nedostaju EMAIL_USER ili EMAIL_PASS environment varijable');
      return {
        success: false,
        error: 'Email nije konfigurisan. Molimo kontaktirajte administratora.'
      };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log('[Email] Transporter kreiran');

    let htmlContent = '';
    let subject = '';

    if (data.tip === 'porudzbina') {
      subject = 'Nova porudžbina';
      htmlContent = `
        <h2>Nova porudžbina</h2>
        <p><strong>Email korisnika:</strong> ${data.email}</p>
        <p><strong>Ukupno:</strong> ${data.ukupno.toFixed(2)} €</p>
        <h3>Stavke:</h3>
        <ul>
          ${data.stavke?.map(s => `
            <li>
              ${s.proizvod?.naziv_sr || 'Nepoznat proizvod'} -
              ${s.kolicina}x -
              ${(s.proizvod?.cena || 0).toFixed(2)} €
            </li>
          `).join('') || '<li>Nema stavki</li>'}
        </ul>
      `;
    } else if (data.tip === 'kontakt') {
      subject = 'Nova kontakt poruka';
      htmlContent = `
        <h2>Nova kontakt poruka</h2>
        <p><strong>Ime:</strong> ${data.ime}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Poruka:</strong></p>
        <p>${data.poruka}</p>
      `;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Šalje email na istu adresu (admin)
      subject: subject,
      html: htmlContent,
    };

    console.log('[Email] Slanje email-a...');
    const info = await transporter.sendMail(mailOptions);
    console.log('[Email] Email uspešno poslat:', info.messageId);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Email] Greška pri slanju email-a:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Nepoznata greška pri slanju email-a'
    };
  }
}
