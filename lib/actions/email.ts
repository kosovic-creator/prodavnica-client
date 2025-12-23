'use server';

import nodemailer from 'nodemailer';

interface PosaljiEmailParams {
  email: string;
  subject: string;
  text?: string;
  html?: string;
  tip: 'porudzbina' | 'placanje';
}

export async function posaljiEmail({ email, subject, text, html, tip }: PosaljiEmailParams) {
  try {
    if (!email || !subject || (!text && !html)) {
      return {
        success: false,
        error: 'Email, subject i sadržaj (text ili html) su obavezni'
      };
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return {
        success: false,
        error: 'Email servis nije konfigurisan'
      };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      tip,
      text: text || undefined,
      html: html || undefined,
    };

    await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: 'Email uspešno poslat'
    };
  } catch (error) {
    return {
      success: false,
      error: 'Greška pri slanju email-a',
      details: error instanceof Error ? error.message : 'Nepoznata greška'
    };
  }
}

export async function posaljiObavestenjePorudzbina({
  korisnikEmail,
  adminEmail,
  subjectKorisnik,
  subjectAdmin,
  tip,
  ukupno,
  stavke,
}: {
  korisnikEmail: string;
  adminEmail: string;
  subjectKorisnik?: string;
  subjectAdmin?: string;
  tip: 'porudzbina' | 'placanje';
  ukupno: number;
  stavke: {
    naziv: string;
    kolicina: number;
    cena: number;
  }[];
}) {
  const stavkeHtml = stavke.length
    ? stavke.map(s => `
      <li>
        ${s.naziv} - ${s.kolicina}x - ${s.cena.toFixed(2)} €
      </li>
    `).join('')
    : '<li>Nema stavki</li>';

  // Automatski naslov ako nije prosleđen
  const naslovKorisnik =
    subjectKorisnik ||
    (tip === 'placanje'
      ? 'Vaša porudžbina je uspešno plaćena putem Montrypay-a'
      : 'Nova porudžbina');

  const naslovAdmin =
    subjectAdmin ||
    (tip === 'placanje'
      ? 'Porudžbina uspešno plaćena putem Montrypay-a'
      : 'Nova porudžbina');

  // Email korisniku
  await posaljiEmail({
    email: korisnikEmail,
    subject: naslovKorisnik,
    tip,
    html: `
      <h2>${naslovKorisnik}</h2>
      <p><strong>Email korisnika:</strong> ${korisnikEmail}</p>
      <p><strong>Ukupno:</strong> ${ukupno.toFixed(2)} €</p>
      <h3>Stavke:</h3>
      <ul>${stavkeHtml}</ul>
    `
  });

  // Email adminu
  await posaljiEmail({
    email: adminEmail,
    subject: naslovAdmin,
    tip,
    html: `
      <h2>${naslovAdmin}</h2>
      <p><strong>Email korisnika:</strong> ${korisnikEmail}</p>
      <p><strong>Ukupno:</strong> ${ukupno.toFixed(2)} €</p>
      <h3>Stavke:</h3>
      <ul>${stavkeHtml}</ul>
    `
  });
}
