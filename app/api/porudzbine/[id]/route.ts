import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'ID porudžbine je obavezan.' }, { status: 400 });
    }

    // Dohvati porudžbinu sa stavkama
    const porudzbina = await prisma.porudzbina.findUnique({
      where: { id },
      include: {
        stavkePorudzbine: {
          include: {
            proizvod: true
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
    });

    if (!porudzbina) {
      return NextResponse.json({ error: 'Porudžbina nije pronađena.' }, { status: 404 });
    }

    return NextResponse.json(porudzbina);
  } catch (error) {
    console.error('Greška pri dohvatanju porudžbine:', error);
    return NextResponse.json({ error: 'Greška pri dohvatanju porudžbine' }, { status: 500 });
  }
}
