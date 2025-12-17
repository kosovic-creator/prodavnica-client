import { NextResponse } from 'next/server';
import { ocistiKorpu } from '@/lib/actions/korpa';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId je obavezan' }, { status: 400 });
    }
    const result = await ocistiKorpu(userId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Greška pri čišćenju korpe' }, { status: 500 });
  }
}
