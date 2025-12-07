'use client';

import { useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';

// Extend the session user type to include 'id'
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } & DefaultSession['user'];
  }
}
import { useRouter } from 'next/navigation';
import { FaCartPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { Proizvod } from '../../../types';
import { dodajUKorpu } from './../../../lib/actions/korpa';
import { useCart } from '../../components/CartContext';

interface AddToCartButtonProps {
  proizvod: Proizvod;
}

export default function AddToCartButton({ proizvod }: AddToCartButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isAdding, setIsAdding] = useState(false);

  const { refreshKorpa } = useCart();
  const handleDodajUKorpu = async () => {
    const korisnikId = session?.user?.id;
    if (!korisnikId) {
      toast.error('Morate biti prijavljeni za korpu', { duration: 4000 });
      router.push('/auth/prijava');
      return;
    }

    if (isAdding) return;

    setIsAdding(true);

    startTransition(async () => {
      try {
        const result = await dodajUKorpu({
          korisnikId,
          proizvodId: proizvod.id,
          kolicina: 1
        });

        if (!result.success) {
          toast.error(result.error || 'Greška pri dodavanju u korpu', { duration: 4000 });
          return;
        }

        // Ažuriraj broj stavki u korpi globalno
        await refreshKorpa();

        toast.success('Proizvod dodat u korpu', { duration: 4000 });
      } catch (error) {
        console.error('Greška:', error);
        toast.error('Došlo je do greške pri dodavanju u korpu', { duration: 4000 });
      } finally {
        setIsAdding(false);
      }
    });
  };

  return (
    <button
      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={handleDodajUKorpu}
      disabled={proizvod.kolicina === 0 || isAdding || isPending}
    >
      {isAdding ? (
        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
      ) : (
        <FaCartPlus />
      )}
      {isAdding
        ? 'Dodaje se...'
        : proizvod.kolicina === 0
          ? 'Nema na zalihama'
          : 'Dodaj u korpu'
      }
    </button>
  );
}