'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Proizvod {
  id: string;
  cena: number;
  slike?: string[];
  naziv_en: string;
  naziv_sr: string;
}

interface BannerRotatorClientProps {
  proizvodi: Proizvod[];
  lang: string;
}

export default function BannerRotatorClient({ proizvodi, lang }: BannerRotatorClientProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (proizvodi.length > 1) {
      const timer = setInterval(() => {
        setCurrent((prev) => (prev + 1) % proizvodi.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [proizvodi]);

  if (!proizvodi || proizvodi.length === 0) {
    return (
      <div className="w-full h-80 bg-linear-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-8">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Dobrodošli u trgovinu</h2>
          <p className="text-blue-100">Pronađite proizvode</p>
        </div>
      </div>
    );
  }

  const proizvod = proizvodi[current];
  const imageUrl = Array.isArray(proizvod.slike) && proizvod.slike.length > 0 ? proizvod.slike[0] : '';
  const naziv = lang === 'en' ? proizvod.naziv_en : proizvod.naziv_sr;
  const cena = proizvod.cena;

  return (
    <div className="w-full h-80 relative overflow-hidden mb-8 rounded-lg shadow-lg bg-white">
      {imageUrl ? (
        <>
          <Image
            src={imageUrl}
            alt={naziv ?? ''}
            fill
            className="object-contain transition-all duration-700 ease-in-out"
            priority
            quality={90}
            sizes="100vw"
          />
          <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-black/70 to-transparent"></div>
          <div className="absolute top-4 left-6 text-white">
            <h3 className="text-2xl font-bold drop-shadow-lg mb-1">{naziv}</h3>
          </div>
          {proizvodi.length > 1 && (
            <div className="absolute bottom-4 right-6 flex space-x-2">
              {proizvodi.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${index === current ? 'bg-white shadow-lg' : 'bg-white/50'}`}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full bg-linear-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          <div className="text-white text-center">
            <h3 className="text-2xl font-bold mb-2">{naziv}</h3>
            <p className="text-xl font-semibold text-blue-200">{cena} €</p>
          </div>
        </div>
      )}
    </div>
  );
}
