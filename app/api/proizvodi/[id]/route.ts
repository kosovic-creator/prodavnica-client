import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
    const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json({ error: 'ID je obavezan.' }, { status: 400 });
  }

  const proizvod = await prisma.proizvod.findUnique({
    where: { id },
    select: {
      id: true,
      cena: true,
      slike: true,
      kolicina: true,
      kreiran: true,
      azuriran: true,
      naziv_en: true,
      naziv_sr: true,
      opis_en: true,
      opis_sr: true,
      karakteristike_en: true,
      karakteristike_sr: true,
      kategorija_en: true,
      kategorija_sr: true,
    }
  });

  if (!proizvod) {
    return NextResponse.json({ error: 'Proizvod nije pronađen.' }, { status: 404 });
  }
  // Vraća sva polja za oba jezika
  return NextResponse.json({
    id: proizvod.id,
    cena: proizvod.cena,
    slike: proizvod.slike || [],
    kolicina: proizvod.kolicina,
    kreiran: proizvod.kreiran,
    azuriran: proizvod.azuriran,
    naziv_sr: proizvod.naziv_sr,
    naziv_en: proizvod.naziv_en,
    opis_sr: proizvod.opis_sr,
    opis_en: proizvod.opis_en,
    karakteristike_sr: proizvod.karakteristike_sr,
    karakteristike_en: proizvod.karakteristike_en,
    kategorija_sr: proizvod.kategorija_sr,
    kategorija_en: proizvod.kategorija_en,
  });
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: 'ID je obavezan.' }, { status: 400 });
    }

    // First check if product exists
    const existingProizvod = await prisma.proizvod.findUnique({
      where: { id }
    });

    if (!existingProizvod) {
      return NextResponse.json({ error: 'Proizvod nije pronađen' }, { status: 404 });
    }

    // Direktno briši proizvod
    await prisma.proizvod.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Proizvod je uspešno obrisan',
      id
    });
  } catch (error) {
    console.error('Error deleting proizvod:', error);
    return NextResponse.json({
      error: 'Greška pri brisanju proizvoda',
      details: error instanceof Error ? error.message : 'Nepoznata greška'
    }, { status: 500 });
  }
}
