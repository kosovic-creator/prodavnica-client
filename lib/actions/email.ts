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
      proizvodiHtml = `<ul style="padding-left:0; margin-bottom:16px;">` +
        porudzbinaData.stavke.map((s: any) =>
          `<li style='list-style:none; margin-bottom:8px; border-bottom:1px solid #eee; padding-bottom:8px;'>
            <span style='font-weight:bold;'>${s.proizvod?.naziv_sr || s.proizvod?.naziv_en || 'Proizvod'}</span> &times; ${s.kolicina} <span style='color:#888;'>(${s.proizvod?.cena} €)</span>
          </li>`
        ).join('') + '</ul>';
    }
    let html = `
      <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 32px; border-radius: 12px; color: #222;">
        <div style="text-align:center; margin-bottom:24px;">
          <h2 style="color:#2196f3; margin-bottom:8px;">Plaćanje uspješno!</h2>
        </div>
        <div style="background:#fff; padding:24px; border-radius:8px; box-shadow:0 2px 8px #eee;">
          <p style="font-size:18px; margin-bottom:12px;">Vaša uplata je uspešno obrađena.</p>
          <p style="font-size:16px; margin-bottom:8px;">Plaćeni iznos: <span style="color:#2196f3; font-weight:bold;">${porudzbinaData.ukupno} €</span></p>
          ${proizvodiHtml ? `<div style=\"margin-top:16px;\"><h3 style=\"font-size:15px; color:#333; margin-bottom:8px;\">Proizvodi:</h3>${proizvodiHtml}</div>` : ''}
          <p style="font-size:15px; color:#555;">Uskoro ćete dobiti više informacija o isporuci na ovaj email.</p>
        </div>
        <div style="text-align:center; margin-top:24px; font-size:13px; color:#888;">
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

    const response = await fetch('/api/email/posalji', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: porudzbinaData.email,
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
