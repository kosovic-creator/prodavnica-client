'use client';

import { useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { FaTrashAlt, FaPlus, FaMinus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { updateStavkuKorpe, ukloniStavkuKorpe } from '@/lib/actions';

interface StavkaKorpe {
  id: string;
  kolicina: number;
  proizvod?: {
    id: string;
    naziv_sr: string;
    naziv_en: string;
    cena: number;
    slika?: string | null;
  } | null;
}

interface KorpaItemProps {
  stavka: StavkaKorpe;
  onUpdate: () => void;
}

export default function KorpaItem({ stavka, onUpdate }: KorpaItemProps) {
  const { t } = useTranslation('korpa');
  const [isPending, startTransition] = useTransition();

  const handleKolicina = async (kolicina: number) => {
    if (kolicina < 1) return;

    startTransition(async () => {
      try {
        const result = await updateStavkuKorpe(stavka.id, kolicina);

        if (!result.success) {
          toast.error(result.error || 'Greška pri ažuriranju');
          return;
        }

        onUpdate();
      } catch (error) {
        console.error('Greška pri ažuriranju kolicine:', error);
        toast.error(t('error') || 'Greška pri ažuriranju količine');
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

        onUpdate();
        toast.success(t('artikal_izbrisan') || 'Artikal je uklonjen iz korpe');
      } catch (error) {
        console.error('Greška pri brisanju stavke:', error);
        toast.error(t('error') || 'Greška pri brisanju stavke');
      }
    });
  };

  if (!stavka.proizvod) return null;

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border">
      <div className="w-20 h-20 relative flex-shrink-0">
        <Image
          src={stavka.proizvod.slika || '/placeholder.png'}
          alt={stavka.proizvod.naziv_sr}
          fill
          className="object-cover rounded-lg"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.png';
          }}
        />
      </div>

      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{stavka.proizvod.naziv_sr}</h3>
        <p className="text-sm text-gray-600">{stavka.proizvod.cena.toFixed(2)} €</p>
      </div>

      <div className="flex items-center gap-2">
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

      <div className="text-right">
        <p className="font-medium">{(stavka.proizvod.cena * stavka.kolicina).toFixed(2)} €</p>
      </div>

      <button
        onClick={handleDelete}
        disabled={isPending}
        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FaTrashAlt className="w-4 h-4" />
      </button>
    </div>
  );
}