import { NextResponse } from 'next/server';

// MonriPay simulacija - idealan za Crnu Goru
// MonriPay (ex-Corvus Pay) je regionalni lider za CG, RS, HR, SI
export async function POST(request: Request) {
  try {
    const { amount, orderId } = await request.json();

    if (!amount || amount < 1) {
      return NextResponse.json({ error: 'Neispravan iznos' }, { status: 400 });
    }

    // Simulacija MonriPay procesa
    const orderNumber = orderId || `MONRI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Za test, simuliramo uspešno MonriPay plaćanje
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/uspjesno_placanje?provider=monripay&order=${orderNumber}&amount=${amount}&status=success`;

    console.log('MonriPay simulation initiated:', {
      orderNumber,
      amount,
      successUrl
    });

    // Simuliramo da korisnik ide na MonriPay gateway i vraća se sa success
    return NextResponse.json({
      success: true,
      redirectUrl: successUrl, // Za test, direktno idemo na success
      orderNumber,
      testMode: true,
      message: 'MonriPay payment simulation - redirecting to success page',
      simulationNote: 'Ovo je simulacija MonriPay plaćanja za test. U production-u bi korisnik bio preusmeren na pravi MonriPay gateway (monri.com).'
    });

  } catch (error) {
    console.error('MonriPay simulation error:', error);
    return NextResponse.json(
      {
        error: 'Greška pri MonriPay simulaciji',
        details: error instanceof Error ? error.message : 'Nepoznata greška'
      },
      { status: 500 }
    );
  }
}
