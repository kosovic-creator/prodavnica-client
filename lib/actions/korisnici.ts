'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { Korisnik,RegistracijaData } from "@/types";


export type UpdateKorisnikData = Korisnik & {
  id: string;
  podaciPreuzimanjaId?: string;
};

export async function getKorisnici(page: number = 1, pageSize: number = 10) {
  try {
    const skip = (page - 1) * pageSize;
    const [korisnici, total] = await Promise.all([
      prisma.korisnik.findMany({
        skip,
        take: pageSize,
        orderBy: { kreiran: 'desc' },
        include: { podaciPreuzimanja: true }
      }),
      prisma.korisnik.count()
    ]);

    return {
      success: true,
      data: { korisnici, total }
    };
  } catch (error) {
    console.error('Error fetching korisnici:', error);
    return {
      success: false,
      error: 'Greška pri učitavanju korisnika'
    };
  }
}

export async function getKorisnikById(id: string) {
  try {
    const korisnik = await prisma.korisnik.findUnique({
      where: { id },
      include: { podaciPreuzimanja: true }
    });

    if (!korisnik) {
      return {
        success: false,
        error: 'Korisnik nije pronađen'
      };
    }

    return {
      success: true,
      data: korisnik
    };
  } catch (error) {
    console.error('Error fetching korisnik:', error);
    return {
      success: false,
      error: 'Greška pri učitavanju korisnika'
    };
  }
}

export async function createKorisnik(data: Partial<Korisnik>) {
  try {
    const { email, lozinka, ime, prezime, uloga = 'korisnik', adresa, drzava, grad, telefon, postanskiBroj } = data;

    if (!email || !lozinka || !ime || !prezime) {
      throw new Error('Nedostaju obavezna polja za korisnika');
    }

    // Provjera da li već postoji korisnik sa tim emailom
    const existing = await prisma.korisnik.findUnique({ where: { email: email as string } });
    if (existing) {
      return {
        success: false,
        error: 'email_exists'
      };
    }

    // Hash lozinke prije upisa
    const hash = await bcrypt.hash(lozinka as string, 10);

    let korisnik;
    if (adresa && drzava && grad && telefon && postanskiBroj) {
      korisnik = await prisma.korisnik.create({
        data: {
          email: email as string,
          lozinka: hash,
          ime: ime as string,
          prezime: prezime as string,
          uloga,
          podaciPreuzimanja: {
            create: {
              adresa,
              drzava: drzava ?? undefined,
              grad,
              telefon,
              postanskiBroj
            }
          }
        },
        include: { podaciPreuzimanja: true }
      });
    } else {
      korisnik = await prisma.korisnik.create({
        data: {
          email: email as string,
          lozinka: hash,
          ime: ime as string,
          prezime: prezime as string,
          uloga
        }
      });
    }

    revalidatePath('/admin/korisnici');

    return {
      success: true,
      data: korisnik
    };
  } catch (error) {
    console.error('Error creating korisnik:', error);
    // Specifična poruka za unique constraint
    if (error instanceof Error && typeof (error as { code?: string }).code === 'string' && (error as { code?: string }).code === 'P2002') {
      return {
        success: false,
        error: 'email_exists'
      };
    }
    return {
      success: false,
      error: 'Greška pri kreiranju korisnika'
    };
  }
}

export async function updateProfilKorisnika(id: string, data: {
  ime: string;
  prezime: string;
  email: string;
  uloga?: string;
}) {
  try {
    const korisnik = await prisma.korisnik.update({
      where: { id },
      data,
      include: { podaciPreuzimanja: true }
    });

    revalidatePath('/profil');
    revalidatePath('/admin/korisnici');

    return {
      success: true,
      data: korisnik
    };
  } catch (error) {
    console.error('Error updating korisnik profile:', error);
    return {
      success: false,
      error: 'Greška pri ažuriranju profila'
    };
  }
}

export async function updateKorisnik(data: UpdateKorisnikData) {
  try {
    const { id, email, lozinka, ime, prezime, uloga, adresa, drzava, grad, telefon, postanskiBroj, podaciPreuzimanjaId } = data;

    const korisnik = await prisma.korisnik.update({
      where: { id },
      data: {
        email,
        lozinka,
        ime: ime ?? undefined,
        prezime,
        uloga,
        podaciPreuzimanja: {
          update: {
            where: { id: podaciPreuzimanjaId },
            data: {
              adresa,
              drzava: drzava ?? undefined,
              grad,
              telefon,
              postanskiBroj
            }
          }
        }
      },
      include: { podaciPreuzimanja: true }
    });

    revalidatePath('/admin/korisnici');

    return {
      success: true,
      data: korisnik
    };
  } catch (error) {
    console.error('Error updating korisnik:', error);
    return {
      success: false,
      error: 'Greška pri ažuriranju korisnika'
    };
  }
}

export async function deleteKorisnik(id: string) {
  try {
    if (!id) {
      return {
        success: false,
        error: 'ID je obavezan.'
      };
    }

    // Check if user exists
    const existingKorisnik = await prisma.korisnik.findUnique({
      where: { id }
    });

    if (!existingKorisnik) {
      return {
        success: false,
        error: 'Korisnik nije pronađen'
      };
    }

    // Check if user has any orders
    const porudzbineCount = await prisma.porudzbina.count({
      where: { korisnikId: id }
    });

    if (porudzbineCount > 0) {
      return {
        success: false,
        error: `Ne možete obrisati korisnika koji ima ${porudzbineCount} porudžbin(a). Prvo obrišite sve porudžbine korisnika.`
      };
    }

    // Delete related data first using transaction
    await prisma.$transaction(async (tx) => {
      // Delete cart items
      await tx.stavkaKorpe.deleteMany({
        where: { korisnikId: id }
      });

      // Delete favorites
      await tx.omiljeni.deleteMany({
        where: { korisnikId: id }
      });

      // Finally delete the user (podaciPreuzimanja will be deleted automatically due to cascade)
      await tx.korisnik.delete({
        where: { id }
      });
    });

    revalidatePath('/admin/korisnici');

    return {
      success: true,
      message: 'Korisnik je uspešno obrisan'
    };
  } catch (error) {
    console.error('Error deleting korisnik:', error);
    return {
      success: false,
      error: 'Greška pri brisanju korisnika'
    };
  }
}

