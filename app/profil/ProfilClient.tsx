"use client";

import type { Korisnik as BaseKorisnik } from '@/types';
import { useTranslation } from 'react-i18next';
import { FaUser, FaEdit } from 'react-icons/fa';
import Link from 'next/link';
import DeleteButton from './DeleteButton';

// Extend Korisnik type to include podaciPreuzimanja for this component
type PodaciPreuzimanja = {
  id: string;
  kreiran: Date;
  azuriran: Date;
  korisnikId: string;
  adresa: string;
  drzava: string;
  grad: string;
  postanskiBroj: number;
  telefon: string;
};
type Korisnik = BaseKorisnik & { podaciPreuzimanja?: PodaciPreuzimanja | null };

export default function ProfilClient({ korisnik, userId }: { korisnik: Korisnik, userId: string }) {
  const { t } = useTranslation('profil');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2 text-center justify-center">
          <FaUser className="text-blue-600" />
          {t('title') || 'Profil'}
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">{t('email') || 'Email'}</span>
                  <p className="text-base text-gray-800">{korisnik.email}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">{t('name') || 'Ime'}</span>
                  <p className="text-base text-gray-800">{korisnik.ime}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">{t('Surname') || 'Prezime'}</span>
                  <p className="text-base text-gray-800">{korisnik.prezime}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">{t('Phone') || 'Telefon'}</span>
                  <p className="text-base text-gray-800">{korisnik.podaciPreuzimanja?.telefon || '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">{t('role') || 'Uloga'}</span>
                  <p className="text-base text-gray-800">{korisnik.uloga}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">{t('country') || 'Država'}</span>
                  <p className="text-base text-gray-800">{korisnik.podaciPreuzimanja?.drzava || '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">{t('city') || 'Grad'}</span>
                  <p className="text-base text-gray-800">{korisnik.podaciPreuzimanja?.grad || '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">{t('postal_code') || 'Poštanski broj'}</span>
                  <p className="text-base text-gray-800">{korisnik.podaciPreuzimanja?.postanskiBroj || '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">{t('address') || 'Adresa'}</span>
                  <p className="text-base text-gray-800">{korisnik.podaciPreuzimanja?.adresa || '-'}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t">
              <Link
                href="/profil/edit"
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-base font-medium"
              >
                <FaEdit />
                {t('edit_profile') || 'Izmeni profil'}
              </Link>
              <DeleteButton userId={userId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
