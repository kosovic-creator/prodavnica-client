
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { posaljiEmailObavjestenje } from '@/lib/actions/email';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ success: false, error: 'Email je obavezan.' });
    const korisnik = await prisma.korisnik.findUnique({ where: { email } });
    if (!korisnik) return NextResponse.json({ success: false, error: 'Korisnik ne postoji.' });

    // Generiši novu lozinku
    const novaLozinka = Math.random().toString(36).slice(-8);
    const hash = await bcrypt.hash(novaLozinka, 10);
    await prisma.korisnik.update({ where: { email }, data: { lozinka: hash } });

    // Pošalji email korisniku sa novom lozinkom
    await posaljiEmailObavjestenje({
      email,
      ukupno: 0,
      subject: 'Reset lozinke - Prodavnica',
      text: `Vaša nova lozinka je: ${novaLozinka}`,
      html: `<div style="font-family:Arial,sans-serif;font-size:16px;"><h2>Reset lozinke</h2><p>Vaša nova lozinka je: <b>${novaLozinka}</b></p></div>`
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Greška pri resetu lozinke.' });
  }
}
