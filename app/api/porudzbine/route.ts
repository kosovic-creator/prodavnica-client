import { NextResponse } from 'next/server';
// Slanje emaila korisniku - non-blocking
import prisma from '@/lib/prisma';


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page')) || 1;
  let pageSize = Number(searchParams.get('pageSize')) || 10;
  const korisnikId = searchParams.get('korisnikId'); // Filtriranje po korisniku
  pageSize = Math.max(pageSize, 10);
  const skip = (page - 1) * pageSize;

  // Kreiraj where uslov za filtriranje
  const whereClause = korisnikId ? { korisnikId } : {};
  const [porudzbine, total] = await Promise.all([
    prisma.porudzbina.findMany({
      where: whereClause,
      skip,
      take: pageSize,
      orderBy: { kreiran: 'desc' },
      include: {
        stavkePorudzbine: {
          include: {
            proizvod: {
              select: {
                id: true,
                cena: true,
                slike: true,
                kolicina: true
              }
            }
          }
        },
        korisnik: {
          select: {
            id: true,
            ime: true,
            prezime: true,
            email: true
          }
        }
      }
    }),
    prisma.porudzbina.count({ where: whereClause }),
  ]);
  return NextResponse.json({ porudzbine, total });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { korisnikId, ukupno, status, email, idPlacanja, stavke } = body;
  if (!korisnikId || !ukupno || !status) {
    return NextResponse.json({ error: 'Nedostaju obavezna polja.' }, { status: 400 });
  }

  const porudzbina = await prisma.$transaction(async (tx) => {
    // Kreiraj porudžbinu
    const novaPorudzbina = await tx.porudzbina.create({
      data: {
        korisnikId,
        ukupno,
        status,
        email,
        idPlacanja,
      },
    });

    // Kreiraj stavke porudžbine i smanji količinu proizvoda
    if (stavke && Array.isArray(stavke)) {
      interface StavkaInput {
        proizvodId: number;
        kolicina: number;
      }

      interface Proizvod {
        id: number;
        cena: number;
        slika?: string | null;
        kolicina: number;
      }

      for (const s of stavke as StavkaInput[]) {
        // Dohvati proizvod da bi dobio trenutnu cenu i sliku
        const proizvod = await tx.proizvod.findUnique({
          where: { id: String(s.proizvodId) }
        }) as Proizvod | null;

        if (!proizvod) {
          throw new Error(`Proizvod sa ID ${s.proizvodId} nije pronađen.`);
        }

          const stavkaData = {
            kolicina: s.kolicina,
            cena: proizvod.cena, // Cena u vreme kupovine
            slika: proizvod.slika || null, // Slika u vreme kupovine
            opis: new Date().toLocaleDateString(),
            porudzbina: {
              connect: { id: String(novaPorudzbina.id) }
            },
            proizvod: {
              connect: { id: String(s.proizvodId) }
            }
          };

          await tx.stavkaPorudzbine.create({
            data: stavkaData,
          });

          // Smanji količinu proizvoda
          await tx.proizvod.update({
            where: { id: String(s.proizvodId) },
            data: { kolicina: { decrement: s.kolicina } },
          });
        // }
      }
    }

    return novaPorudzbina;
  });
  return NextResponse.json(porudzbina);
}
export async function PUT(req: Request) {
  const body = await req.json();
  const { id, ...data } = body;
  if (!id) {
    return NextResponse.json({ error: 'ID je obavezan.' }, { status: 400 });
  }
  const porudzbina = await prisma.porudzbina.update({
    where: { id },
    data,
  });
  return NextResponse.json(porudzbina);
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID je obavezan.' }, { status: 400 });
    }

    // First check if order exists
    const existingPorudzbina = await prisma.porudzbina.findUnique({
      where: { id },
      include: {
        stavkePorudzbine: true
      }
    });

    if (!existingPorudzbina) {
      return NextResponse.json({ error: 'Porudžbina nije pronađena' }, { status: 404 });
    }

    // Delete related data first in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete order items first
      await tx.stavkaPorudzbine.deleteMany({
        where: { porudzbinaId: id }
      });

      // Then delete the order
      await tx.porudzbina.delete({
        where: { id }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Porudžbina je uspešno obrisana',
      id
    });
  } catch (error) {
    console.error('Error deleting porudzbina:', error);
    return NextResponse.json({
      error: 'Greška pri brisanju porudžbine',
      details: error instanceof Error ? error.message : 'Nepoznata greška'
    }, { status: 500 });
  }
}
