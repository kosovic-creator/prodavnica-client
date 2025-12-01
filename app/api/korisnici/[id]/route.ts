import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';


export async function GET(req: Request) {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
  if (!id) {
    return NextResponse.json({ error: 'ID je obavezan.' }, { status: 400 });
  }
  const korisnik = await prisma.korisnik.findUnique({ where: { id }, include: { podaciPreuzimanja: true } });
  if (!korisnik) {
    return NextResponse.json({ error: 'Korisnik nije pronađen.' }, { status: 404 });
  }
  return NextResponse.json(korisnik);
}

// export async function DELETE(request: Request) {
//   try {
//     const { id } = await request.json();

//     if (!id) {
//       return NextResponse.json({ error: 'ID je obavezan.' }, { status: 400 });
//     }

//     // First check if user exists
//     const existingKorisnik = await prisma.korisnik.findUnique({
//       where: { id }
//     });

//     if (!existingKorisnik) {
//       return NextResponse.json({ error: 'Korisnik nije pronađen' }, { status: 404 });
//     }

// export async function DELETE(req: Request) {
//   try {
//     const url = new URL(req.url);
//     const id = url.pathname.split('/').pop();

//     if (!id) {
//       return NextResponse.json({ error: 'ID je obavezan.' }, { status: 400 });
//     }

//     // First check if user exists
//     const existingKorisnik = await prisma.korisnik.findUnique({
//       where: { id }
//     });

//     if (!existingKorisnik) {
//       return NextResponse.json({ error: 'Korisnik nije pronađen' }, { status: 404 });
//     }

//     // Check if user has any orders - we might want to prevent deletion if they have orders
//     const porudzbineCount = await prisma.porudzbina.count({
//       where: { korisnikId: id }
//     });

//     if (porudzbineCount > 0) {
//       return NextResponse.json({
//         error: 'Ne možete obrisati korisnika koji ima porudžbine. Prvo obrišite sve porudžbine korisnika.',
//         ordersCount: porudzbineCount
//       }, { status: 409 }); // 409 Conflict
//     }

//     // Delete related data first
//     await prisma.$transaction(async (tx) => {
//       // Delete cart items
//       await tx.stavkaKorpe.deleteMany({
//         where: { korisnikId: id }
//       });

//       // Delete favorites
//       await tx.omiljeni.deleteMany({
//         where: { korisnikId: id }
//       });

//       // Finally delete the user
//       await tx.korisnik.delete({
//         where: { id }
//       });
//     });

//     return NextResponse.json({
//       success: true,
//       message: 'Korisnik je uspešno obrisan',
//       id
//     });
//   } catch (error) {
//     console.error('Error deleting korisnik:', error);
//     return NextResponse.json({
//       error: 'Greška pri brisanju korisnika',
//       details: error instanceof Error ? error.message : 'Nepoznata greška'
//     }, { status: 500 });
//   }
// }
