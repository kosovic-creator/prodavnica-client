export async function posaljiEmailObavjestenje(porudzbinaData) {
  try {
    console.log('Slanje email-a na:', porudzbinaData.email);
    const response = await fetch('/api/email/posalji', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: porudzbinaData.email,
        subject: 'Potvrda o plaćanju - Prodavnica',
        text: `Vaša porudžbina je uspešno kreirana. Ukupno: ${porudzbinaData.ukupno} €.`,
        html: `
          <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 32px; border-radius: 12px; color: #222;">
            <div style="text-align:center; margin-bottom:24px;">
              <h2 style="color:#2196f3; margin-bottom:8px;">Hvala na kupovini!</h2>
              <img src='https://cdn-icons-png.flaticon.com/512/833/833472.png' alt='Potvrda' width='64' style='margin-bottom:16px;' />
            </div>
            <div style="background:#fff; padding:24px; border-radius:8px; box-shadow:0 2px 8px #eee;">
              <p style="font-size:18px; margin-bottom:12px;">Vaša porudžbina je uspešno obrađena.</p>
              <p style="font-size:16px; margin-bottom:8px;">Ukupan iznos: <span style="color:#2196f3; font-weight:bold;">${porudzbinaData.ukupno} €</span></p>
              <p style="font-size:15px; color:#555;">Uskoro ćete dobiti više informacija o isporuci na ovaj email.</p>
            </div>
            <div style="text-align:center; margin-top:24px; font-size:13px; color:#888;">
              <p>Prodavnica &copy; 2025</p>
            </div>
          </div>
        `
      }),
    });
    const data = await response.json();
    console.log('Odgovor API rute za email:', data);
    return data.success;
  } catch (error) {
    console.error('Greška pri slanju email-a:', error);
    return false;
  }
}
