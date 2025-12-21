import { NextResponse } from 'next/server';
import { ocistiKorpu } from '@/lib/actions/korpa';


// Koristi se za čišćenje korpe za određenog korisnika ali se poziva iz klijentske strane preko fetch API-ja a ona poziva funkciju iz
// actions/korpa
export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId je obavezan' }, { status: 400 });
    }
    const result = await ocistiKorpu(userId);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ success: false, error: 'Greška pri čišćenju korpe' }, { status: 500 });
  }
}
