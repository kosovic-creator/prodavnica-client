export const runtime = "nodejs";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  console.log("[REGISTRACIJA] --- Handler pozvan ---");
  try {
    const data = await request.json();
    console.log("[REGISTRACIJA] Primljen payload:", data);
    const { email, lozinka, ime, prezime } = data;
    const postoji = await prisma.korisnik.findUnique({ where: { email } });
    if (postoji) {
      console.log("[REGISTRACIJA] Email već postoji:", email);
      return NextResponse.json({ error: "Email već postoji." }, { status: 400 });
    }
    const hash = await bcrypt.hash(lozinka, 10);
    console.log("[REGISTRACIJA] Hashovana lozinka:", hash);
    await prisma.korisnik.create({
      data: {
        email,
        lozinka: hash,
        ime,
        prezime,
      },
    });
    console.log("[REGISTRACIJA] Uspešno kreiran korisnik:", email);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[REGISTRACIJA] Greška:", error);
    return NextResponse.json({ error: "Greška pri registraciji." }, { status: 500 });
  }
}
