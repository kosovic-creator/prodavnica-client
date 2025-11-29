'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import '@/i18n/config';

interface ProizvodServerAction {
  id: string;
  cena: number;
  slike?: string[];
  slika?: string | null; // for backward compatibility
  kolicina: number;
  kreiran: Date;
  azuriran: Date;
  naziv_en: string;
  naziv_sr: string;
  opis_en: string | null;
  opis_sr: string | null;
  karakteristike_en: string | null;
  karakteristike_sr: string | null;
  kategorija_en: string;
  kategorija_sr: string;
}

interface ProizvodiBannerClientProps {
  initialProizvodi: ProizvodServerAction[];
}

export default function ProizvodiBannerClient({ initialProizvodi }: ProizvodiBannerClientProps) {
  const { t, i18n } = useTranslation('proizvodi');
  const [proizvodi, setProizvodi] = useState<ProizvodServerAction[]>(initialProizvodi || []);
  const [current, setCurrent] = useState(0);

  // Filter products with images for the banner
  useEffect(() => {
    if (initialProizvodi && initialProizvodi.length > 0) {
      // Use first image from 'slike' array if available, otherwise fallback to 'slika'
      const proizvodiSaSlikama = initialProizvodi.filter((p: ProizvodServerAction) => {
        const img = Array.isArray(p.slike) && p.slike.length > 0 ? p.slike[0] : p.slika;
        return img && img.trim() !== '' && (img.startsWith('http') || img.startsWith('/'));
      });
      if (proizvodiSaSlikama.length > 0) {
        setProizvodi(proizvodiSaSlikama);
      } else {
        setProizvodi(initialProizvodi);
      }
    }
  }, [initialProizvodi]);

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
      <div className="w-full h-80 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-8">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-2">{t('dobrodosli_trgovina')}</h2>
          <p className="text-blue-100">{t('pronađite_proizvode')}</p>
        </div>
      </div>
    );
  }

  const currentProizvod = proizvodi[current];
  const imageUrl = currentProizvod && Array.isArray(currentProizvod.slike) && currentProizvod.slike.length > 0
    ? currentProizvod.slike[0]
    : (currentProizvod?.slika || '');
  const currentLang = i18n.language || 'sr';
  const naziv = currentLang === 'en' ? currentProizvod?.naziv_en : currentProizvod?.naziv_sr;
  const cena = currentProizvod?.cena;

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
            onError={(e) => {
              console.error('Image failed to load:', imageUrl);
              const target = e.target as HTMLImageElement;
              // Fallback: prvo pokušaj sa currentProizvod.slika, ako ni to ne postoji, koristi lokalni placeholder
              if (target.src !== '/placeholder.jpg') {
                target.src = '/placeholder.jpg';
              }
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', imageUrl);
            }}
          />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/70 to-transparent"></div>
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
        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          <div className="text-white text-center">
            <h3 className="text-2xl font-bold mb-2">{naziv}</h3>
            <p className="text-xl font-semibold text-blue-200">{cena} €</p>
          </div>
        </div>
      )}
    </div>
  );
}