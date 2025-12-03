import { NextResponse } from 'next/server';
import { createKorisnik } from '@/lib/actions/korisnici';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await createKorisnik(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'register.error_occurred' });
  }
}
