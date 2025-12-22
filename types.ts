
export interface Proizvodi {
  id: string; // Change from number to string
  cena: number;
  slike: string[];
  kolicina: number;
  kreiran: Date;
  azuriran: Date;
  naziv_sr: string;
  naziv_en: string;
  opis_sr: string | null;
  opis_en: string | null;
  karakteristike_sr: string | null;
  karakteristike_en: string | null;
  kategorija_sr: string;
  kategorija_en: string;
  slika?: string; // Add this if it's used in your code
}
export interface Korisnik {
  id: string;
  email: string;
  lozinka: string;
  uloga: string;
  ime?: string | null;
  prezime: string;
  telefon: string;
  drzava?: string | null;
  grad: string;
  postanskiBroj: number;
  adresa: string;
  slika?: string | null;
  emailVerifikovan?: boolean;
  emailVerifikacijaToken?: string | null;
  emailVerifikacijaIstice?: Date | null;
  kreiran: Date;
  azuriran: Date;
};

export interface StavkaPorudzbine {
  id: string;
  kolicina: number;
  cena: number;
  slika?: string | null;
  proizvod?: {
    naziv_sr: string;
    naziv_en: string;
  };
}

export interface Porudzbina {
  id: string;
  kreiran: Date;
  ukupno: number;
  status: string;
  stavkePorudzbine?: StavkaPorudzbine[];
}
// export type ProizvodPrevod = {
//   id: string;
//   // API polja
//   naziv: string;
//   opis: string;
//   kategorija: string;
//   karakteristike?: string;
//   // Lokalizovana polja
//   naziv_sr?: string;
//   naziv_en?: string;
//   opis_sr?: string;
//   opis_en?: string;
//   karakteristike_sr?: string;
//   karakteristike_en?: string;
//   kategorija_sr?: string;
//   kategorija_en?: string;
//   cena: number;
//   kolicina: number;
//   slike?: string[];
//   kreiran: Date;
//   azuriran: Date;
// }



