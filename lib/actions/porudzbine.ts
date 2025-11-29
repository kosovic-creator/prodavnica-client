'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

type KreirajPorudzbinuData = {
  korisnikId: string;
  ukupno: number;
  status: string;
  email?: string;
  stavke: {
    proizvodId: string;
    kolicina: number;
    cena: number;
    opis?: string;
    slike?: string[];
  }[];
};

export async function getPorudzbine(page: number = 1, pageSize: number = 10) {
  try {
    const skip = (page - 1) * pageSize;

    const [porudzbine, total] = await Promise.all([
      prisma.porudzbina.findMany({
        skip,
        take: pageSize,
        orderBy: { kreiran: 'desc' },
        include: {
          korisnik: {
            select: {
              id: true,
              email: true,
              ime: true,
              prezime: true
            }
          },
          stavkePorudzbine: {
            include: {
              proizvod: {
                select: {
                  id: true,
                  naziv_sr: true,
                  naziv_en: true,
                  slike: true
                }
              }
            }
          }
        }
      }),
      prisma.porudzbina.count()
    ]);

    return {
      success: true,
      data: { porudzbine, total }
    };
  } catch (error) {
    console.error('Error fetching porudzbine:', error);
    return {
      success: false,
      error: 'Greška pri učitavanju porudžbina'
    };
  }
}

export async function getPorudzbineKorisnika(korisnikId: string, page: number = 1, pageSize: number = 10) {
  try {
    if (!korisnikId) {
      return {
        success: true,
        data: { porudzbine: [], total: 0 }
      };
    }

    const skip = (page - 1) * pageSize;

    const [porudzbine, total] = await Promise.all([
      prisma.porudzbina.findMany({
        where: { korisnikId },
        skip,
        take: pageSize,
        orderBy: { kreiran: 'desc' },
        include: {
          stavkePorudzbine: {
            include: {
              proizvod: {
                select: {
                  id: true,
                  naziv_sr: true,
                  naziv_en: true,
                  slike: true,
                  cena: true
                }
              }
            }
          }
        }
      }),
      prisma.porudzbina.count({ where: { korisnikId } })
    ]);

    return {
      success: true,
      data: { porudzbine, total }
    };
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return {
      success: false,
      error: 'Greška pri učitavanju vaših porudžbina'
    };
  }
}

export async function getPorudzbinuById(id: string) {
  try {
    const porudzbina = await prisma.porudzbina.findUnique({
      where: { id },
      include: {
        korisnik: {
          select: {
            id: true,
            email: true,
            ime: true,
            prezime: true,
            podaciPreuzimanja: true
          }
        },
        stavkePorudzbine: {
          include: {
            proizvod: {
              select: {
                id: true,
                naziv_sr: true,
                naziv_en: true,
                opis_sr: true,
                opis_en: true,
                slike: true,
                cena: true
              }
            }
          }
        }
      }
    });

    if (!porudzbina) {
      return {
        success: false,
        error: 'Porudžbina nije pronađena'
      };
    }

    return {
      success: true,
      data: porudzbina
    };
  } catch (error) {
    console.error('Error fetching order:', error);
    return {
      success: false,
      error: 'Greška pri učitavanju porudžbine'
    };
  }
}

export async function kreirajPorudzbinu(data: KreirajPorudzbinuData) {
  try {
    const { korisnikId, ukupno, status, email, stavke } = data;

    if (!korisnikId || !stavke || stavke.length === 0) {
      return {
        success: false,
        error: 'Neispravni podaci za porudžbinu'
      };
    }

    // Create order with order items in transaction
    const porudzbina = await prisma.$transaction(async (tx) => {
      // Create the order
      const novaPorudzbina = await tx.porudzbina.create({
        data: {
          korisnikId,
          ukupno,
          status,
          email
        }
      });

      // Create order items
      const stavkePorudzbine = await Promise.all(
        stavke.map(stavka =>
          tx.stavkaPorudzbine.create({
            data: {
              porudzbinaId: novaPorudzbina.id,
              proizvodId: stavka.proizvodId,
              kolicina: stavka.kolicina,
              cena: stavka.cena,
              opis: stavka.opis,
              slika: Array.isArray(stavka.slike) ? stavka.slike[0] : stavka.slike
            }
          })
        )
      );

      return { ...novaPorudzbina, stavkePorudzbine };
    });

    revalidatePath('/admin/porudzbine');
    revalidatePath('/moje-porudzbine');

    return {
      success: true,
      data: porudzbina
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return {
      success: false,
      error: 'Greška pri kreiranju porudžbine'
    };
  }
}

export async function updateStatusPorudzbine(id: string, status: string) {
  try {
    if (!id || !status) {
      return {
        success: false,
        error: 'Neispravni podaci'
      };
    }

    const porudzbina = await prisma.porudzbina.update({
      where: { id },
      data: { status }
    });

    revalidatePath('/admin/porudzbine');
    revalidatePath('/moje-porudzbine');
    revalidatePath(`/admin/porudzbine/${id}`);

    return {
      success: true,
      data: porudzbina,
      message: 'Status porudžbine je uspešno ažuriran'
    };
  } catch (error) {
    console.error('Error updating order status:', error);
    return {
      success: false,
      error: 'Greška pri ažuriranju statusa porudžbine'
    };
  }
}

export async function deletePorudzbinu(id: string) {
  try {
    if (!id) {
      return {
        success: false,
        error: 'ID je obavezan.'
      };
    }

    // Check if order exists
    const existingPorudzbina = await prisma.porudzbina.findUnique({
      where: { id }
    });

    if (!existingPorudzbina) {
      return {
        success: false,
        error: 'Porudžbina nije pronađena'
      };
    }

    // Delete order (order items will be deleted automatically due to cascade)
    await prisma.porudzbina.delete({
      where: { id }
    });

    revalidatePath('/admin/porudzbine');
    revalidatePath('/moje-porudzbine');

    return {
      success: true,
      message: 'Porudžbina je uspešno obrisana'
    };
  } catch (error) {
    console.error('Error deleting order:', error);
    return {
      success: false,
      error: 'Greška pri brisanju porudžbine'
    };
  }
}