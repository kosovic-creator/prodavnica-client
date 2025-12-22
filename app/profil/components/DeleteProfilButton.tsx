'use client';

import { useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import ConfirmModal from '@/app/components/ui/ConfirmModal';

interface DeleteProfilButtonProps {
  handleDeleteKorisnik: () => Promise<void>;
  translations: Record<string, string>;
}

export default function DeleteProfilButton({
  handleDeleteKorisnik,
  translations: t
}: DeleteProfilButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await handleDeleteKorisnik();
    } catch (error) {
      console.error('Greška pri brisanju profila:', error);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-red-600 text-white px-4 py-3 rounded-lg shadow-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-base font-medium"
      >
        <FaTrash />
        {t.obrisi_korisnika || 'Obriši nalog'}
      </button>

     <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t.confirm_delete_account || 'Potvrdi brisanje naloga'}
        message={
          t.confirm_delete_account_message ||
          'Da li ste sigurni da želite obrisati svoj nalog? Ova akcija se ne može poništiti i svi vaši podaci će biti trajno obrisani.'
        }
        confirmText={t.delete || 'Obriši'}
        cancelText={t.cancel || 'Otkaži'}
        loadingText={t.deleting || 'Brisanje...'}
        isDestructive={true}
        isLoading={isDeleting}
      />
    </>
  );
}
