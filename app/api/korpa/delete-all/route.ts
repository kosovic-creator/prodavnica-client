import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const { korisnikId } = await request.json();
  if (!korisnikId) return NextResponse.json({ error: 'Neispravan korisnikId' }, { status: 400 });

  try {
    const result = await prisma.stavkaKorpe.deleteMany({
      where: { korisnikId }
    });

    console.log(`Obrisano ${result.count} stavki za korisnika ${korisnikId}`);

    return NextResponse.json({
      success: true,
      deletedCount: result.count
    });
  } catch (error) {
    console.error('Greška pri brisanju svih stavki:', error);
    return NextResponse.json({ error: 'Greška pri brisanju' }, { status: 500 });
  }
}