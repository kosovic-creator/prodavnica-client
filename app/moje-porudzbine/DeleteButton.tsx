'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FaTrash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { deletePorudzbinu } from '@/lib/actions';

interface DeleteButtonProps {
  porudzbinaId: string;
}

export default function DeleteButton({ porudzbinaId }: DeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deletePorudzbinu(porudzbinaId);

        if (result.success) {
          toast.success('Porudžbina je uspešno obrisana');
          setConfirmDelete(false);
          router.refresh();
        } else {
          toast.error(result.error || 'Greška pri brisanju porudžbine');
        }
      } catch (error) {
        console.error('Error deleting porudzbina:', error);
        toast.error('Greška pri brisanju porudžbine');
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setConfirmDelete(true)}
        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isPending}
        title="Obriši porudžbinu"
      >
        <FaTrash className="w-4 h-4" />
      </button>

      {/* Confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900">Potvrda brisanja</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Da li ste sigurni da želite da obrišete ovu porudžbinu?
                  Ova akcija se ne može poništiti.
                </p>
              </div>
              <div className="flex justify-center gap-3 px-4 py-3">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  disabled={isPending}
                >
                  Otkaži
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  disabled={isPending}
                >
                  {isPending ? 'Briše...' : 'Obriši'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}