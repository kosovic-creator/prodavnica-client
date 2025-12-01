import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const omiljeni = await prisma.omiljeni.findMany({
      where: { korisnikId: session.user.id },
      include: {
        proizvod: {
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
        }
      },
      orderBy: { kreiran: 'desc' }
    });

    return NextResponse.json(omiljeni);
  } catch (error) {
    console.error('Error fetching omiljeni:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { proizvodId } = await request.json();

    if (!proizvodId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const omiljeni = await prisma.omiljeni.create({
      data: {
        korisnikId: session.user.id,
        proizvodId
      }
    });

    return NextResponse.json(omiljeni, { status: 201 });
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Already in favorites' }, { status: 400 });
    }
    console.error('Error adding omiljeni:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}