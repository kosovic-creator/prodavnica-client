import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const { korisnikId, proizvodId, kolicina } = await request.json();
  if (!korisnikId) {
    return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });
  }
  // Proveri da li korisnik postoji
  const korisnik = await prisma.korisnik.findUnique({ where: { id: korisnikId } });
  if (!korisnik) {
    return NextResponse.json({ error: 'Korisnik ne postoji' }, { status: 400 });
  }
  // Dodaj ili ažuriraj stavku u korpi
  try {
    const existing = await prisma.stavkaKorpe.findUnique({
      where: { korisnikId_proizvodId: { korisnikId, proizvodId } }
    });
    let stavka;
    if (existing) {
      stavka = await prisma.stavkaKorpe.update({
        where: { id: existing.id },
        data: { kolicina: existing.kolicina + (kolicina || 1) }
      });
    } else {
      stavka = await prisma.stavkaKorpe.create({
        data: { korisnikId, proizvodId, kolicina: kolicina || 1 }
      });
    }
    return NextResponse.json({ stavka });
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'P2003'
    ) {
      return NextResponse.json({ error: 'Neispravan korisnik ili proizvod.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Greška prilikom dodavanja u korpu.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const korisnikId = searchParams.get('korisnikId');
  if (!korisnikId) return NextResponse.json({ stavke: [] });
  const stavke = await prisma.stavkaKorpe.findMany({
    where: { korisnikId },
    include: { proizvod: true },
  });
  return NextResponse.json({ stavke });
}

export async function PUT(request: Request) {
  const { id, kolicina } = await request.json();
  if (!id || !kolicina) return NextResponse.json({ error: 'Neispravni podaci' }, { status: 400 });
  const stavka = await prisma.stavkaKorpe.update({
    where: { id },
    data: { kolicina },
  });
  return NextResponse.json({ stavka });
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'Neispravan ID' }, { status: 400 });
  const stavka = await prisma.stavkaKorpe.delete({ where: { id } });
  return NextResponse.json({ stavka });
}
