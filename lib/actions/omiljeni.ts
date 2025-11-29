'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getOmiljeni(korisnikId: string) {
  try {
    if (!korisnikId) {
      return {
        success: true,
        data: { omiljeni: [] }
      };
    }

    const omiljeni = await prisma.omiljeni.findMany({
      where: { korisnikId },
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

    // Transform data to match the expected format with prevodi structure
    const transformedOmiljeni = omiljeni.map(item => ({
      ...item,
      proizvod: {
        id: item.proizvod.id,
        cena: item.proizvod.cena,
        slika: Array.isArray(item.proizvod.slike) ? item.proizvod.slike[0] : item.proizvod.slike,
        kolicina: item.proizvod.kolicina,
        kreiran: item.proizvod.kreiran,
        azuriran: item.proizvod.azuriran,
        prevodi: [
          {
            id: `${item.proizvod.id}-sr`,
            proizvodId: item.proizvod.id,
            jezik: 'sr',
            naziv: item.proizvod.naziv_sr || '',
            opis: item.proizvod.opis_sr,
            karakteristike: item.proizvod.karakteristike_sr,
            kategorija: item.proizvod.kategorija_sr || ''
          },
          {
            id: `${item.proizvod.id}-en`,
            proizvodId: item.proizvod.id,
            jezik: 'en',
            naziv: item.proizvod.naziv_en || '',
            opis: item.proizvod.opis_en,
            karakteristike: item.proizvod.karakteristike_en,
            kategorija: item.proizvod.kategorija_en || ''
          }
        ]
      }
    }));

    return {
      success: true,
      data: { omiljeni: transformedOmiljeni }
    };
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return {
      success: false,
      error: 'Greška pri učitavanju omiljenih proizvoda'
    };
  }
}

export async function dodajUOmiljene(korisnikId: string, proizvodId: string) {
  try {
    if (!korisnikId) {
      return {
        success: false,
        error: 'Niste prijavljeni'
      };
    }

    if (!proizvodId) {
      return {
        success: false,
        error: 'Neispravan proizvod ID'
      };
    }

    // Check if already in favorites
    const existing = await prisma.omiljeni.findUnique({
      where: { korisnikId_proizvodId: { korisnikId, proizvodId } }
    });

    if (existing) {
      return {
        success: false,
        error: 'Proizvod je već u omiljenim'
      };
    }

    const omiljeni = await prisma.omiljeni.create({
      data: { korisnikId, proizvodId },
      include: {
        proizvod: {
          select: {
            id: true,
            cena: true,
            slike: true,
            kolicina: true,
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
      }
    });

    revalidatePath('/omiljeni');
    revalidatePath('/proizvodi');
    revalidatePath(`/proizvodi/${proizvodId}`);

    return {
      success: true,
      data: omiljeni,
      message: 'Proizvod je dodat u omiljene'
    };
  } catch (error) {
    console.error('Error adding to favorites:', error);

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
      error: 'Greška prilikom dodavanja u omiljene.'
    };
  }
}

export async function ukloniIzOmiljenih(korisnikId: string, proizvodId: string) {
  try {
    if (!korisnikId) {
      return {
        success: false,
        error: 'Niste prijavljeni'
      };
    }

    if (!proizvodId) {
      return {
        success: false,
        error: 'Neispravan proizvod ID'
      };
    }

    // Check if exists in favorites
    const existing = await prisma.omiljeni.findUnique({
      where: { korisnikId_proizvodId: { korisnikId, proizvodId } }
    });

    if (!existing) {
      return {
        success: false,
        error: 'Proizvod nije u omiljenim'
      };
    }

    await prisma.omiljeni.delete({
      where: { korisnikId_proizvodId: { korisnikId, proizvodId } }
    });

    revalidatePath('/omiljeni');
    revalidatePath('/proizvodi');
    revalidatePath(`/proizvodi/${proizvodId}`);

    return {
      success: true,
      message: 'Proizvod je uklonjen iz omiljenih'
    };
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return {
      success: false,
      error: 'Greška prilikom uklanjanja iz omiljenih'
    };
  }
}

export async function provjeriDaLiJeOmiljenj(korisnikId: string, proizvodId: string) {
  try {
    if (!korisnikId || !proizvodId) {
      return {
        success: true,
        data: { isOmiljenj: false }
      };
    }

    const omiljeni = await prisma.omiljeni.findUnique({
      where: { korisnikId_proizvodId: { korisnikId, proizvodId } }
    });

    return {
      success: true,
      data: { isOmiljenj: !!omiljeni }
    };
  } catch (error) {
    console.error('Error checking if favorite:', error);
    return {
      success: false,
      error: 'Greška pri provjeri omiljenih'
    };
  }
}