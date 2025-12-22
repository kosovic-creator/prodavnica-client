'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaEye } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import { useState, useTransition } from 'react';
import { ukloniIzOmiljenih } from '@/lib/actions/omiljeni';

interface ProizvodPrevod {
  jezik: string;
  naziv: string;
}

interface Proizvod {
  id: string;
  slika?: string;
  naziv_en: string;
  naziv_sr: string;
  opis_en: string;
  opis_sr: string;
  karakteristike_en: string;
  karakteristike_sr: string;
  kategorija_en: string;
  kategorija_sr: string;
  kolicina: number;
  cena: number;
  prevodi?: ProizvodPrevod[];
}

interface OmiljeniItem {
  id: string;
  proizvod: Proizvod;
  korisnikId: string;
}

interface Translation {
  ukloni_iz_omiljenih?: string;
  kategorija: string;
  kolicina: string;
  detalji: string;
}

export default function OmiljeniList({
  omiljeni,
  lang,
  t,
}: {
  omiljeni: OmiljeniItem[];
  lang: string;
  t: Translation;
}) {
  const [items, setItems] = useState(omiljeni);
  const [isPending, startTransition] = useTransition();

  async function obrisiOmiljeni(id: string) {
    // Pretpostavljamo da korisnikId postoji u omiljeni itemu (možete ga proslediti kao prop ako treba)
    const proizvodId = items.find(o => o.id === id)?.proizvod?.id;
    const korisnikId = items.find(o => o.id === id)?.korisnikId; // ili prosledite kao prop

    if (!korisnikId || !proizvodId) return;

    startTransition(async () => {
      const res = await ukloniIzOmiljenih(korisnikId, proizvodId);
      if (res.success) {
        setItems(prev => prev.filter(o => o.id !== id));
      } else {
        // Dodajte prikaz greške po potrebi
        alert(res.error || 'Greška prilikom uklanjanja iz omiljenih');
      }
    });
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 ml-4">
      {items.map(o => (
        <div
          key={o.id}
          className="bg-white border border-gray-200 rounded-lg flex flex-col shadow-sm hover:shadow-md transition-shadow cursor-pointer relative p-3 pl-4"
        >
          <button
            type="button"
            title={t.ukloni_iz_omiljenih || "Obriši"}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition-colors z-10"
            onClick={async (e) => {
              e.preventDefault();
              await obrisiOmiljeni(o.id);
            }}
          >
            <FiX size={20} />
          </button>
          {o.proizvod.slika && (
            <div className="mb-3 flex justify-center">
              <Image
                src={o.proizvod.slika}
                alt={
                  lang === 'en'
                    ? o.proizvod.prevodi?.find((p: { jezik: string }) => p.jezik === 'en')?.naziv || ''
                    : o.proizvod.prevodi?.find((p: { jezik: string }) => p.jezik === 'sr')?.naziv || ''
                }
                width={100}
                height={100}
                className="object-cover rounded-md"
              />
            </div>
          )}
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
              {lang === 'en' ? o.proizvod.naziv_en : o.proizvod.naziv_sr}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2">
              {lang === 'en' ? o.proizvod.opis_en : o.proizvod.opis_sr}
            </p>
            <p className="text-gray-500 text-xs line-clamp-1">
              {lang === 'en' ? o.proizvod.karakteristike_en : o.proizvod.karakteristike_sr}
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                {t.kategorija}: {lang === 'en' ? o.proizvod.kategorija_en : o.proizvod.kategorija_sr}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold text-blue-700">{o.proizvod.cena} €</div>
              <div className={`text-xs font-medium px-2 py-1 rounded ${o.proizvod.kolicina === 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                {t.kolicina}: {o.proizvod.kolicina}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Link
                href={`/proizvodi/${o.proizvod.id}?lang=${lang}`}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
              >
                <FaEye />
                {t.detalji}
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}