import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { proizvodId, kolicina } = await request.json();

    if (!proizvodId || !kolicina || kolicina <= 0) {
      return NextResponse.json(
        { error: 'Neispravni parametri' },
        { status: 400 }
      );
    }

    // Prvo proveravamo trenutno stanje
    const proizvod = await prisma.proizvod.findUnique({
      where: { id: proizvodId }
    });

    if (!proizvod) {
      return NextResponse.json(
        { error: 'Proizvod nije pronađen' },
        { status: 404 }
      );
    }

    if (proizvod.kolicina < kolicina) {
      return NextResponse.json(
        { error: 'Nedovoljno stanja na lageru' },
        { status: 400 }
      );
    }

    // Umanji stanje proizvoda
    const updatedProizvod = await prisma.proizvod.update({
      where: { id: proizvodId },
      data: {
        kolicina: {
          decrement: kolicina
        }
      }
    });

    console.log(`Stanje proizvoda ${proizvodId} umanjeno sa ${proizvod.kolicina} na ${updatedProizvod.kolicina}`);

    return NextResponse.json({
      message: 'Stanje je uspešno ažurirano',
      novoStanje: updatedProizvod.kolicina
    });

  } catch (error) {
    console.error('Greška pri ažuriranju stanja:', error);
    return NextResponse.json(
      { error: 'Greška pri ažuriranju stanja proizvoda' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}