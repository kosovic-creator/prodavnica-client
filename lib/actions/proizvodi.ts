'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type ProizvodData = {
  cena: number;
  slike: string[];
  kolicina?: number;
  naziv_sr: string;
  opis_sr?: string;
  karakteristike_sr?: string;
  kategorija_sr: string;
  naziv_en: string;
  opis_en?: string;
  karakteristike_en?: string;
  kategorija_en: string;
};

export type UpdateProizvodData = ProizvodData & {
  id: string;
};

export async function getProizvodi(page: number = 1, pageSize: number = 10, search?: string) {
  try {
    const skip = (page - 1) * pageSize;

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

    // Transform data to include both language fields
    const proizvodiSaPrevod = proizvodi.map(proizvod => ({
      id: proizvod.id,
      cena: proizvod.cena,
      slike: proizvod.slike,
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

    return {
      success: true,
      data: { proizvodi: proizvodiSaPrevod, total }
    };
  } catch (error) {
    console.error('Error fetching proizvodi:', error);
    return {
      success: false,
      error: 'Greška pri učitavanju proizvoda'
    };
  }
}

export async function getProizvodById(id: string) {
  try {
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
      },
    });

    if (!proizvod) {
      return {
        success: false,
        error: 'Proizvod nije pronađen'
      };
    }

    return {
      success: true,
      data: proizvod
    };
  } catch (error) {
    console.error('Error fetching proizvod:', error);
    return {
      success: false,
      error: 'Greška pri učitavanju proizvoda'
    };
  }
}

export async function createProizvod(data: ProizvodData) {
  try {
    console.log('Server Action createProizvod payload:', JSON.stringify(data, null, 2));

    const proizvod = await prisma.proizvod.create({
      data: {
        ...data,
        kolicina: data.kolicina || 1
      }
    });

    revalidatePath('/admin/proizvodi');
    revalidatePath('/proizvodi');

    return {
      success: true,
      data: proizvod
    };
  } catch (error) {
    console.error('Error creating proizvod:', error);
    return {
      success: false,
      error: 'Greška pri kreiranju proizvoda'
    };
  }
}

export async function updateProizvod(data: UpdateProizvodData) {
  try {
    const { id, ...proizvodData } = data;

    const proizvod = await prisma.proizvod.update({
      where: { id },
      data: proizvodData
    });

    revalidatePath('/admin/proizvodi');
    revalidatePath('/proizvodi');
    revalidatePath(`/proizvodi/${id}`);

    return {
      success: true,
      data: proizvod
    };
  } catch (error) {
    console.error('Error updating proizvod:', error);
    return {
      success: false,
      error: 'Greška pri ažuriranju proizvoda'
    };
  }
}

export async function deleteProizvod(id: string) {
  try {
    if (!id) {
      return {
        success: false,
        error: 'ID je obavezan.'
      };
    }

    // Check if product exists
    const existingProizvod = await prisma.proizvod.findUnique({
      where: { id }
    });

    if (!existingProizvod) {
      return {
        success: false,
        error: 'Proizvod nije pronađen'
      };
    }

    // Check if product is in any orders
    const stavkePorudzbineCount = await prisma.stavkaPorudzbine.count({
      where: { proizvodId: id }
    });

    if (stavkePorudzbineCount > 0) {
      return {
        success: false,
        error: `Ne možete obrisati proizvod koji je u ${stavkePorudzbineCount} porudžbin(a).`
      };
    }

    // Delete related data first using transaction
    await prisma.$transaction(async (tx) => {
      // Delete cart items
      await tx.stavkaKorpe.deleteMany({
        where: { proizvodId: id }
      });

      // Delete favorites
      await tx.omiljeni.deleteMany({
        where: { proizvodId: id }
      });

      // Finally delete the product
      await tx.proizvod.delete({
        where: { id }
      });
    });

    revalidatePath('/admin/proizvodi');
    revalidatePath('/proizvodi');

    return {
      success: true,
      message: 'Proizvod je uspešno obrisan'
    };
  } catch (error) {
    console.error('Error deleting proizvod:', error);
    return {
      success: false,
      error: 'Greška pri brisanju proizvoda'
    };
  }
}

export async function updateProizvodStanje(id: string, kolicina: number) {
  try {
    const proizvod = await prisma.proizvod.update({
      where: { id },
      data: { kolicina }
    });

    revalidatePath('/admin/proizvodi');
    revalidatePath('/proizvodi');
    revalidatePath(`/proizvodi/${id}`);

    return {
      success: true,
      data: proizvod
    };
  } catch (error) {
    console.error('Error updating proizvod stanje:', error);
    return {
      success: false,
      error: 'Greška pri ažuriranju stanja proizvoda'
    };
  }
}