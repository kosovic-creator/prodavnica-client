import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - lista svih podataka preuzimanja za korisnika
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('korisnikId');
  if (!userId) return NextResponse.json({ error: 'Missing korisnikId' }, { status: 400 });
  const podaci = await prisma.podaciPreuzimanja.findMany({ where: { korisnikId: userId }, include: { korisnik: true } });
  return NextResponse.json(podaci);
}

// POST - dodaj podatke preuzimanja
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { korisnikId, adresa, drzava, grad, postanskiBroj, telefon } = body;
  if (!korisnikId || !adresa || !drzava || !grad || !postanskiBroj || !telefon) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const novi = await prisma.podaciPreuzimanja.create({
    data: { korisnikId, adresa, drzava, grad, postanskiBroj, telefon }
  });
  return NextResponse.json(novi);
}

// PUT - izmeni podatke preuzimanja
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, adresa, drzava, grad, postanskiBroj, telefon } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const izmenjeni = await prisma.podaciPreuzimanja.update({
    where: { id },
    data: { adresa, drzava, grad, postanskiBroj, telefon }
  });
  return NextResponse.json(izmenjeni);
}

// DELETE - obrisi podatke preuzimanja
export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await prisma.podaciPreuzimanja.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
