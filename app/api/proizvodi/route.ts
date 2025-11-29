import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page')) || 1;
  let pageSize = Number(searchParams.get('pageSize')) || 10;
  pageSize = Math.max(pageSize, 10);
  const skip = (page - 1) * pageSize;
  const search = searchParams.get('search') || '';

  const where = search && search.trim() !== '' ? {
    OR: [
      { naziv_sr: { contains: search, mode: 'insensitive' as const } },
      { naziv_en: { contains: search, mode: 'insensitive' as const } },
      { opis_sr: { contains: search, mode: 'insensitive' as const } },
      { opis_en: { contains: search, mode: 'insensitive' as const } },
      { kategorija_sr: { contains: search, mode: 'insensitive' as const } },
      { kategorija_en: { contains: search, mode: 'insensitive' as const } },
    ]
  } : undefined;

  const [proizvodi, total] = await Promise.all([
    prisma.proizvod.findMany({
      skip,
      take: pageSize,
      orderBy: { kreiran: 'desc' },
      where,
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
      },
    }),
    prisma.proizvod.count({ where }),
  ]);

  // Vraća sva polja za oba jezika za svaki proizvod
  const proizvodiSaPrevod = proizvodi.map(proizvod => ({
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
  }));
  return NextResponse.json({ proizvodi: proizvodiSaPrevod, total });
}

export async function POST(request: Request) {
  const data = await request.json();
  // Debug log: prikaz ulaznih podataka
  console.log('API /api/proizvodi POST payload:', JSON.stringify(data, null, 2));

  // Očekuje payload sa poljima za oba jezika
  const proizvodData = data;
  try {
    const proizvod = await prisma.proizvod.create({
      data: proizvodData
    });
    return NextResponse.json({ proizvod });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const data = await request.json();
  const { id, ...proizvodData } = data;
  try {
    const proizvod = await prisma.proizvod.update({
      where: { id },
      data: proizvodData
    });
    return NextResponse.json({ proizvod });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}


