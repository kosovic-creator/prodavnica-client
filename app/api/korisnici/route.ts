import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || '1');
  let pageSize = Number(searchParams.get('pageSize') || '10');
  pageSize = Math.max(pageSize, 10);
  const skip = (page - 1) * pageSize;
  const [korisnici, total] = await Promise.all([
    prisma.korisnik.findMany({ skip, take: pageSize, orderBy: { kreiran: 'desc' }, include: { podaciPreuzimanja: true } }),
    prisma.korisnik.count()
  ]);
  return NextResponse.json({ korisnici, total });
}


export async function POST(request: Request) {
  const data = await request.json();
  const { email, lozinka, ime, prezime, uloga, adresa, drzava, grad, telefon, postanskiBroj } = data;
  const korisnik = await prisma.korisnik.create({
    data: {
      email,
      lozinka,
      ime,
      prezime,
      uloga,
      podaciPreuzimanja: {
         create: {
            adresa,
            drzava,
            grad,
            telefon,
            postanskiBroj
          }
      }
    },
    include: { podaciPreuzimanja: true }
  });
  return NextResponse.json({ korisnik });
}

export async function PUT(request: Request) {
  const data = await request.json();
  const { id, email, lozinka, ime, prezime, uloga, adresa, drzava, grad, telefon, postanskiBroj } = data;
  const korisnik = await prisma.korisnik.update({
    where: { id },
    data: {
      email,
      lozinka,
      ime,
      prezime,
      uloga,
      podaciPreuzimanja: {
        update: {
          where: { id: data.podaciPreuzimanjaId },
          data: {
            adresa,
            drzava,
            grad,
            telefon,
            postanskiBroj
          }
        }
      }
    },
    include: { podaciPreuzimanja: true }
  });
  return NextResponse.json({ korisnik });
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID je obavezan.' }, { status: 400 });
    }

    // First check if user exists
    const existingKorisnik = await prisma.korisnik.findUnique({
      where: { id }
    });

    if (!existingKorisnik) {
      return NextResponse.json({ error: 'Korisnik nije pronađen' }, { status: 404 });
    }

    // Check if user has any orders - we might want to prevent deletion if they have orders
    const porudzbineCount = await prisma.porudzbina.count({
      where: { korisnikId: id }
    });

    if (porudzbineCount > 0) {
      return NextResponse.json({
        error: 'Ne možete obrisati korisnika koji ima porudžbine. Prvo obrišite sve porudžbine korisnika.',
        ordersCount: porudzbineCount
      }, { status: 409 }); // 409 Conflict
    }

    // Delete related data first
    await prisma.$transaction(async (tx) => {
      // Delete cart items
      await tx.stavkaKorpe.deleteMany({
        where: { korisnikId: id }
      });

      // Delete favorites
      await tx.omiljeni.deleteMany({
        where: { korisnikId: id }
      });

      // Finally delete the user
      await tx.korisnik.delete({
        where: { id }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Korisnik je uspešno obrisan',
      id
    });
  } catch (error) {
    console.error('Error deleting korisnik:', error);
    return NextResponse.json({
      error: 'Greška pri brisanju korisnika',
      details: error instanceof Error ? error.message : 'Nepoznata greška'
    }, { status: 500 });
  }
}



