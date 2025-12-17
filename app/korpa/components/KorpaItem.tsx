'use client';

import { useTransition } from 'react';
// SSR lokalizacija: primaj lang i t kao prop
import Image from 'next/image';
import { FaTrashAlt, FaPlus, FaMinus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { updateStavkuKorpe, ukloniStavkuKorpe } from '@/lib/actions';
import { useCart } from '../../components/CartContext';

interface StavkaKorpe {
  id: string;
  kolicina: number;
  proizvod?: {
    id: string;
    naziv_sr: string;
    naziv_en: string;
    cena: number;
    slike?: string | null;
  } | null;
}

interface KorpaItemProps {
  stavka: StavkaKorpe;
  lang: string;
  t: Record<string, string>;
}

export default function KorpaItem({ stavka, lang, t }: KorpaItemProps) {
  const [isPending, startTransition] = useTransition();
  const { refreshKorpa } = useCart();

  const handleKolicina = async (kolicina: number) => {
    if (kolicina < 1) return;

    startTransition(async () => {
      try {
        const result = await updateStavkuKorpe(stavka.id, kolicina);

        if (!result.success) {
          toast.error(result.error || 'Greška pri ažuriranju');
          return;
        }

        await refreshKorpa();
        window.location.reload();
      } catch (error) {
        console.error('Greška pri ažuriranju kolicine:', error);
        toast.error(t.error || 'Greška pri ažuriranju količine');
      }
    });
  };

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        const result = await ukloniStavkuKorpe(stavka.id);

        if (!result.success) {
          toast.error(result.error || 'Greška pri brisanju');
          return;
        }

        await refreshKorpa();
        window.location.reload();
        // toast.success(t('artikal_izbrisan') || 'Artikal je uklonjen iz korpe');
      } catch (error) {
        console.error('Greška pri brisanju stavke:', error);
        toast.error(t.error || 'Greška pri brisanju stavke');
      }
    });
  };

  if (!stavka.proizvod) return null;

  const imageUrl = Array.isArray(stavka.proizvod.slike) && stavka.proizvod.slike.length > 0
    ? stavka.proizvod.slike[0]
    : '/placeholder.png';
  const naziv = lang === 'en' ? stavka.proizvod.naziv_en : stavka.proizvod.naziv_sr;
  return (
    <div className="flex flex-row items-center gap-4 p-4 bg-white rounded-lg shadow-sm border min-h-24">
      {/* Slika */}
      <div className="w-20 h-20 relative shrink-0 flex items-center justify-center">
        <Image
          src={imageUrl}
          alt={naziv}
          fill
          sizes="(max-width: 768px) 100vw, 80px"
          className="object-contain rounded-lg"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.png';
          }}
        />
      </div>
      {/* Info i kontrole */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{naziv}</h3>
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => handleKolicina(stavka.kolicina - 1)}
            disabled={isPending || stavka.kolicina <= 1}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaMinus className="w-3 h-3" />
          </button>
          <span className="w-8 text-center font-medium">{stavka.kolicina}</span>
          <button
            onClick={() => handleKolicina(stavka.kolicina + 1)}
            disabled={isPending}
            className="w-8 h-8 flex items-center justify-center bg-blue-100 hover:bg-blue-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlus className="w-3 h-3" />
          </button>
        </div>
      </div>
      {/* Cijena i delete */}
      <div className="flex flex-col items-end gap-2 min-w-20">
        <p className="font-medium text-lg">{(stavka.proizvod.cena * stavka.kolicina).toFixed(2)} €</p>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaTrashAlt className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}