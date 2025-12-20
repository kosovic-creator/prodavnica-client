'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type DodajUKorpuData = {
  korisnikId: string;
  proizvodId: string;
  kolicina?: number;
};

export async function dodajUKorpu(data: DodajUKorpuData) {
  try {
    const { korisnikId, proizvodId, kolicina = 1 } = data;

    if (!korisnikId) {
      return {
        success: false,
        error: 'Niste prijavljeni'
      };
    }

    // Check if user exists
    const korisnik = await prisma.korisnik.findUnique({
      where: { id: korisnikId }
    });

    if (!korisnik) {
      return {
        success: false,
        error: 'Korisnik ne postoji'
      };
    }

    // Check if item already exists in cart
    const existing = await prisma.stavkaKorpe.findUnique({
      where: { korisnikId_proizvodId: { korisnikId, proizvodId } }
    });

    let stavka;

    if (existing) {
      // Update existing item
      stavka = await prisma.stavkaKorpe.update({
        where: { id: existing.id },
        data: { kolicina: existing.kolicina + kolicina }
      });
    } else {
      // Create new item
      stavka = await prisma.stavkaKorpe.create({
        data: { korisnikId, proizvodId, kolicina }
      });
    }

    revalidatePath('/korpa');

    return {
      success: true,
      data: stavka
    };
  } catch (error) {
    console.error('Error adding to cart:', error);

    // Handle foreign key constraint error
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'P2003'
    ) {
      return {
        success: false,
        error: 'Neispravan korisnik ili proizvod.'
      };
    }

    return {
      success: false,
      error: 'Greška prilikom dodavanja u korpu.'
    };
  }
}

export async function getKorpa(korisnikId: string) {
  try {
    if (!korisnikId) {
      return {
        success: true,
        data: { stavke: [] }
      };
    }

    const stavke = await prisma.stavkaKorpe.findMany({
      where: { korisnikId },
      include: { proizvod: true },
      orderBy: { kreiran: 'desc' }
    });

    return {
      success: true,
      data: { stavke }
    };
  } catch (error) {
    console.error('Error fetching cart:', error);
    return {
      success: false,
      error: 'Greška pri učitavanju korpe'
    };
  }
}

export async function updateStavkuKorpe(id: string, kolicina: number) {
  try {
    if (!id || !kolicina || kolicina < 1) {
      return {
        success: false,
        error: 'Neispravni podaci'
      };
    }

    const stavka = await prisma.stavkaKorpe.update({
      where: { id },
      data: { kolicina },
    });

    revalidatePath('/korpa');

    return {
      success: true,
      data: stavka
    };
  } catch (error) {
    console.error('Error updating cart item:', error);
    return {
      success: false,
      error: 'Greška pri ažuriranju stavke korpe'
    };
  }
}

export async function ukloniStavkuKorpe(id: string) {
  try {
    if (!id) {
      return {
        success: false,
        error: 'Neispravan ID'
      };
    }

    const stavka = await prisma.stavkaKorpe.delete({
      where: { id }
    });

    revalidatePath('/korpa');

    return {
      success: true,
      data: stavka
    };
  } catch (error) {
    console.error('Error removing cart item:', error);
    return {
      success: false,
      error: 'Greška pri uklanjanju stavke iz korpe'
    };
  }
}

export async function ocistiKorpu(korisnikId: string) {
  try {
    if (!korisnikId) {
      return {
        success: false,
        error: 'Neispravan korisnik ID'
      };
    }

    await prisma.stavkaKorpe.deleteMany({
      where: { korisnikId }
    });

    revalidatePath('/proizvodi');

    return {
      success: true,
      message: 'Korpa je uspešno očišćena'
    };
  } catch (error) {
    console.error('Error clearing cart:', error);
    return {
      success: false,
      error: 'Greška pri čišćenju korpe'
    };
  }
}