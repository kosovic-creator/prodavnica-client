/* eslint-disable @typescript-eslint/no-explicit-any */
interface PorudzbinaData {
  email: string;
  ukupno: number;
}

interface EmailApiResponse {
  success: boolean;
  [key: string]: any;
}

interface PorudzbinaData {
  email: string;
  ukupno: number;
  tip?: string;
  stavke?: any[];
  subject?: string;
  text?: string;
  html?: string;
}

export async function posaljiEmailObavjestenje(porudzbinaData: PorudzbinaData): Promise<boolean> {
  try {
    console.log('Slanje email-a na:', porudzbinaData.email);
    let subject = 'Potvrda o uspješnom plaćanju - Prodavnica';
    let text = `Vaša uplata je uspešno obrađena. Plaćeni iznos: ${porudzbinaData.ukupno} €.`;
    let proizvodiHtml = '';
    if (Array.isArray(porudzbinaData.stavke) && porudzbinaData.stavke.length > 0) {
      proizvodiHtml = `
        <ul class="mb-2 divide-y divide-gray-200" style="padding-left:0; margin-bottom:16px;">
          ${porudzbinaData.stavke.map((s: any) =>
            `<li class="py-2 flex justify-between items-center" style="list-style:none; margin-bottom:8px; border-bottom:1px solid #eee; padding-bottom:8px;">
              <span class="font-medium text-gray-800">${s.proizvod?.naziv_sr || s.proizvod?.naziv_en || 'Proizvod'}</span>
              <span class="text-gray-600">x${s.kolicina}</span>
              <span class="text-blue-600 font-semibold">${(s.proizvod?.cena || 0).toFixed(2)} €</span>
            </li>`
          ).join('')}
        </ul>
      `;
    }
    let html = `
      <div class="font-sans bg-gray-50 p-8 rounded-xl text-gray-900" style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 32px; border-radius: 12px; color: #222;">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-blue-600 mb-2" style="color:#2196f3; margin-bottom:8px;">Plaćanje uspješno!</h2>
        </div>
        <div class="bg-white rounded-lg shadow p-6 w-full max-w-md mx-auto" style="background:#fff; padding:24px; border-radius:8px; box-shadow:0 2px 8px #eee;">
          <p class="text-lg mb-2">Vaša uplata je uspešno obrađena.</p>
          <p class="text-base mb-2">Plaćeni iznos: <span class="text-blue-600 font-bold">${porudzbinaData.ukupno} €</span></p>
          ${proizvodiHtml ? `<div class=\"mt-4\"><h3 class=\"text-base font-semibold text-gray-700 mb-2\">Proizvodi:</h3>${proizvodiHtml}</div>` : ''}
          <p class="text-sm text-gray-600 mt-4">Uskoro ćete dobiti više informacija o isporuci na ovaj email.</p>
        </div>
        <div class="text-center mt-6 text-xs text-gray-400" style="text-align:center; margin-top:24px; font-size:13px; color:#888;">
          <p>Prodavnica &copy; 2025</p>
        </div>
      </div>
    `;

    // Ako je tip emaila porudzbina, koristi poseban sadržaj
    if (porudzbinaData.tip === 'porudzbina') {
      subject = 'Potvrda o uspješnom kreiranju porudžbine - Prodavnica';
      text = `Vaša porudžbina je uspešno kreirana. Ukupan iznos: ${porudzbinaData.ukupno} €.`;
      let proizvodiHtml = '';
      if (Array.isArray(porudzbinaData.stavke) && porudzbinaData.stavke.length > 0) {
        proizvodiHtml = `<ul style="padding-left:0; margin-bottom:16px;">` +
          porudzbinaData.stavke.map((s: any) =>
            `<li style='list-style:none; margin-bottom:8px; border-bottom:1px solid #eee; padding-bottom:8px;'>
              <span style='font-weight:bold;'>${s.proizvod?.naziv_sr || s.proizvod?.naziv_en || 'Proizvod'}</span> &times; ${s.kolicina} <span style='color:#888;'>(${s.proizvod?.cena} €)</span>
            </li>`
          ).join('') + '</ul>';
      }
      html = `
        <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 32px; border-radius: 12px; color: #222;">
          <div style="text-align:center; margin-bottom:24px;">
            <h2 style="color:#4caf50; margin-bottom:8px;">Porudžbina uspešno kreirana!</h2>
          </div>
          <div style="background:#fff; padding:24px; border-radius:8px; box-shadow:0 2px 8px #eee;">
            <p style="font-size:18px; margin-bottom:12px;">Vaša porudžbina je uspešno kreirana.</p>
            <p style="font-size:16px; margin-bottom:8px;">Ukupan iznos: <span style="color:#4caf50; font-weight:bold;">${porudzbinaData.ukupno} €</span></p>
            <div style="margin-top:16px;">
              <h3 style="font-size:15px; color:#333; margin-bottom:8px;">Proizvodi:</h3>
              ${proizvodiHtml}
            </div>
            <p style="font-size:15px; color:#555;">Uskoro ćete dobiti više informacija o isporuci na ovaj email.</p>
          </div>
          <div style="text-align:center; margin-top:24px; font-size:13px; color:#888;">
            <p>Prodavnica &copy; 2025</p>
          </div>
        </div>
      `;
    }

    // Fallback email ako je undefined ili prazan
    const emailToSend = porudzbinaData.email && porudzbinaData.email.trim() !== '' ? porudzbinaData.email : 'test@example.com';

    const response = await fetch('/api/email/posalji', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: emailToSend,
        subject,
        text,
        html
      }),
    });
    const data: EmailApiResponse = await response.json();
    console.log('Odgovor API rute za email:', data);
    return data.success;
  } catch (error) {
    console.error('Greška pri slanju email-a:', error);
    return false;
  }
}
