export type Proizvod = {
  id: string;
  // API polja
  naziv: string;
  opis: string;
  kategorija: string;
  karakteristike?: string;
  // Lokalizovana polja
  naziv_sr?: string;
  naziv_en?: string;
  opis_sr?: string;
  opis_en?: string;
  karakteristike_sr?: string;
  karakteristike_en?: string;
  kategorija_sr?: string;
  kategorija_en?: string;
  cena: number;
  kolicina: number;
  slike?: string[];
  kreiran: Date;
  azuriran: Date;
}

// Tip koji odgovara strukturi Server Actions
export type ProizvodServerAction = {
  id: string;
  cena: number;
  slika: string | null;
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
}

// export type Proizvod = {
//   id: string;
//   // API polja
//   cena: number;
//   slika?: string | null;
//   kolicina: number;
//   naziv: string;
//   opis?: string | null;
//   kategorija: string;
//   karakteristike?: string | null;
//   // Lokalizovana polja
//   naziv_sr: string;
//   naziv_en: string;
//   opis_sr?: string;
//   opis_en?: string;
//   karakteristike_sr?: string;
//   karakteristike_en?: string;
//   kategorija_sr: string;
//   kategorija_en: string;
//   kreiran?: Date;
//   azuriran?: Date;
// };


export type Korisnik = {
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

export type StavkaKorpe = {
  id: string;
  korisnikId: string;
  proizvodId: string;
  kolicina: number;
  kreiran: Date;
  azuriran: Date;
  proizvod?: Proizvod;
};

export type Porudzbina = {
  id: string;
  korisnikId: string;
  ime: string;
  prezime: string;
  ukupno: number;
  status: string;
  email?: string | null;
  kreiran: Date;
  azuriran: Date;
  idPlacanja?: string | null;
  stavkePorudzbine?: StavkaPorudzbine[];
  korisnik: {
    id: string;
    ime: string | null;
    prezime: string | null;
    email: string;
  };
};

export type StavkaPorudzbine = {
  id: string;
  porudzbinaId: string;
  proizvodId: string;
  kolicina: number;
  cena: number;
  slika?: string | null;
  opis?: string | null;
  kreiran: Date;
  azuriran: Date;
  proizvod?: Proizvod;
};

export type Omiljeni = {
  id: string;
  korisnikId: string;
  proizvodId: string;
  kreiran: Date;
  proizvod: {
    id: string;
    cena: number;
    slika?: string | null;
    kolicina: number;
    kreiran: Date;
    azuriran: Date;
    prevodi: Array<{
      id: string;
      proizvodId: string;
      jezik: string;
      naziv: string;
      opis?: string | null;
      karakteristike?: string | null;
      kategorija: string;
    }>;
  };
};

export type ProizvodTranslation = {
  id: string;
  proizvodId: string;
  jezik: string;
  naziv: string;
  opis?: string | null;
  karakteristike?: string | null;
  kategorija: string;
};

export type TranslationData = {
  naziv: string;
  opis: string;
  karakteristike: string;
  kategorija: string;
};

