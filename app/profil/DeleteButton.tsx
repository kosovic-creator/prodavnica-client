'use client';

import { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ui/ConfirmModal';
import { deleteKorisnik } from '@/lib/actions';
import { useCallback } from 'react';

interface DeleteButtonProps {
  userId: string;
}

export default function DeleteButton({ userId }: DeleteButtonProps) {
  const { t: tProfil } = useTranslation('profil');
  const { t: tKorisnici } = useTranslation('korisnici');
  // Helper za validaciju iz oba namespace-a
  const t = useCallback((key: string) => tKorisnici(key) !== key ? tKorisnici(key) : tProfil(key), [tKorisnici, tProfil]);

  const [isPending, startTransition] = useTransition();
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteModal = () => {
    setDeleteModal({ isOpen: true });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    startTransition(async () => {
      try {
        const result = await deleteKorisnik(userId);

        if (!result.success) {
          toast.error(result.error || t('greska_pri_cuvanju'));
          return;
        }

        toast.success(t('korisnik_obrisan'));
        // Redirect to home page after successful deletion
        window.location.href = '/';
      } catch (error) {
        console.error('Error deleting profile:', error);
        toast.error(t('greska_pri_cuvanju'));
      } finally {
        setIsDeleting(false);
      }
    });
  };

  return (
    <>
      <button
        className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg shadow-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-base font-medium"
        onClick={openDeleteModal}
        disabled={isPending}
      >
        <FaTrash />
        {t('obrisi_korisnika')}
      </button>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title={t('obrisi_korisnika')}
        message={t('potvrda_brisanja_profila') || 'Da li ste sigurni da želite da obrišete svoj profil? Ova akcija se ne može poništiti i svi vaši podaci će biti trajno obrisani.'}
        confirmText={t('confirm') || 'Obriši'}
        cancelText={t('cancel') || 'Otkaži'}
        isDestructive={true}
        isLoading={isDeleting}
      />
    </>
  );
}