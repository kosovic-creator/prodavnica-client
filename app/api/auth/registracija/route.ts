import { NextResponse } from 'next/server';
import { registrujKorisnika } from '@/lib/actions';

export async function POST(request: Request) {
  const data = await request.json();
  const result = await registrujKorisnika(data);
  return NextResponse.json(result);
}
