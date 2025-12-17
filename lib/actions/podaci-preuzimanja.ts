'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type PodaciPreuzimanjaData = {
  adresa: string;
  drzava: string;
  grad: string;
  postanskiBroj: number;
  telefon: string;
};

export async function getPodaciPreuzimanja(korisnikId: string) {
  try {
    if (!korisnikId) {
      return {
        success: false,
        error: 'Niste prijavljeni'
      };
    }

    const podaci = await prisma.podaciPreuzimanja.findUnique({
      where: { korisnikId }
    });

    return {
      success: true,
      data: podaci
    };
  } catch (error) {
    console.error('Error fetching delivery data:', error);
    return {
      success: false,
      error: 'Greška pri učitavanju podataka za preuzimanje'
    };
  }
}

export async function createPodaciPreuzimanja(korisnikId: string, data: PodaciPreuzimanjaData) {
  try {
    if (!korisnikId) {
      return {
        success: false,
        error: 'Niste prijavljeni'
      };
    }

    // Check if delivery data already exists for this user
    const existing = await prisma.podaciPreuzimanja.findUnique({
      where: { korisnikId }
    });

    if (existing) {
      return {
        success: false,
        error: 'Podaci za preuzimanje već postoje za ovog korisnika'
      };
    }

    const podaci = await prisma.podaciPreuzimanja.create({
      data: {
        korisnikId,
        ...data
      }
    });

    revalidatePath('/podaci-preuzimanja');
    revalidatePath('/profil');

    return {
      success: true,
      data: podaci,
      message: 'Podaci za preuzimanje su uspešno kreirani'
    };
  } catch (error) {
    console.error('Error creating delivery data:', error);
    return {
      success: false,
      error: 'Greška pri kreiranju podataka za preuzimanje'
    };
  }
}

export async function updatePodaciPreuzimanja(korisnikId: string, data: PodaciPreuzimanjaData) {
  try {
    if (!korisnikId) {
      return {
        success: false,
        error: 'Niste prijavljeni'
      };
    }

    // Check if delivery data exists for this user
    const existing = await prisma.podaciPreuzimanja.findUnique({
      where: { korisnikId }
    });

    let podaci;

    if (existing) {
      // Update existing data
      podaci = await prisma.podaciPreuzimanja.update({
        where: { korisnikId },
        data
      });
    } else {
      // Create new data if doesn't exist
      podaci = await prisma.podaciPreuzimanja.create({
        data: {
          korisnikId,
          ...data
        }
      });
    }

    revalidatePath('/podaci-preuzimanja');
    revalidatePath('/profil');

    return {
      success: true,
      data: podaci,
      message: 'Podaci za preuzimanje su uspešno ažurirani'
    };
  } catch (error) {
    console.error('Error updating delivery data:', error);
    return {
      success: false,
      error: 'Greška pri ažuriranju podataka za preuzimanje'
    };
  }
}

export async function deletePodaciPreuzimanja(korisnikId: string) {
  try {
    if (!korisnikId) {
      return {
        success: false,
        error: 'Niste prijavljeni'
      };
    }

    // Check if delivery data exists for this user
    const existing = await prisma.podaciPreuzimanja.findUnique({
      where: { korisnikId }
    });

    if (!existing) {
      return {
        success: false,
        error: 'Podaci za preuzimanje ne postoje'
      };
    }

    await prisma.podaciPreuzimanja.delete({
      where: { korisnikId }
    });

    revalidatePath('/podaci-preuzimanja');
    revalidatePath('/profil');

    return {
      success: true,
      message: 'Podaci za preuzimanje su uspešno obrisani'
    };
  } catch (error) {
    console.error('Error deleting delivery data:', error);
    return {
      success: false,
      error: 'Greška pri brisanju podataka za preuzimanje'
    };
  }
}