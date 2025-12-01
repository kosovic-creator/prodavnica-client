import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ stavkaId: string }> }
) {
  try {
    const { stavkaId } = await context.params;

    if (!stavkaId) {
      return NextResponse.json({ error: 'Neispravan stavkaId' }, { status: 400 });
    }

    console.log('Brisanje stavke sa ID:', stavkaId);

    const result = await prisma.stavkaKorpe.delete({
      where: { id: stavkaId }
    });

    console.log('Uspešno obrisana stavka:', result);

    return NextResponse.json({ success: true, deletedItem: result });
  } catch (error) {
    console.error('Greška pri brisanju stavke:', error);
    return NextResponse.json({ error: 'Greška pri brisanju stavke' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ stavkaId: string }> }
) {
  try {
    const { stavkaId } = await context.params;
    const { kolicina } = await request.json();

    if (!stavkaId || !kolicina) {
      return NextResponse.json({ error: 'Neispravni podaci' }, { status: 400 });
    }

    const result = await prisma.stavkaKorpe.update({
      where: { id: stavkaId },
      data: { kolicina }
    });

    return NextResponse.json({ success: true, updatedItem: result });
  } catch (error) {
    console.error('Greška pri ažuriranju stavke:', error);
    return NextResponse.json({ error: 'Greška pri ažuriranju' }, { status: 500 });
  }
}