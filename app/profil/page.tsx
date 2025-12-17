/* eslint-disable @typescript-eslint/no-explicit-any */

import { getServerSession } from 'next-auth';
import { getKorisnikById } from '@/lib/actions';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/authOptions';

import sr from '@/i18n/locales/sr/profil.json';
import en from '@/i18n/locales/en/profil.json';

import { FaEdit, FaTrash } from 'react-icons/fa';
import { deleteKorisnik } from '@/lib/actions/korisnici';
import { revalidatePath } from 'next/cache';


export default async function ProfilPage({ searchParams }: { searchParams?: { lang?: string, err?: string } | Promise<{ lang?: string, err?: string }> }) {
  let params: { lang?: string, err?: string } = {};
  if (searchParams) {
    if (typeof (searchParams as Promise<any>).then === 'function') {
      params = await (searchParams as Promise<any>);
    } else {
      params = searchParams as { lang?: string, err?: string };
    }
  }
  const lang = params?.lang === 'en' ? 'en' : 'sr';
  const t = lang === 'en' ? en : sr;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/auth/prijava');
  }

  async function handleDeleteKorisnik() {
    'use server';
    if (!session?.user?.id) {
      redirect('/auth/prijava');
    }
    const userId = session.user.id;
    const result = await deleteKorisnik(userId);
    if (!result.success) {
      const params = new URLSearchParams();
      params.append('err', result.error || t.error_izmjena_korisnika || 'Greška pri brisanju korisnika');
      redirect(`/profil?${params.toString()}`);
    }
    revalidatePath('/');
    redirect('/');
  }

  const result = await getKorisnikById(session.user.id);
  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{t.error_fetch_korisnik || 'Greška pri učitavanju profila'}</div>
          <p className="text-gray-600">{result.error}</p>
        </div>
      </div>
    );
  }

  const korisnik = {
    ...result.data,
    telefon: result.data.podaciPreuzimanja?.telefon ?? '',
    grad: result.data.podaciPreuzimanja?.grad ?? '',
    postanskiBroj: Number(result.data.podaciPreuzimanja?.postanskiBroj) || 0,
    adresa: result.data.podaciPreuzimanja?.adresa ?? '',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2 text-center justify-center">
          <span className="inline-block text-blue-600"><svg width="24" height="24" fill="currentColor"><circle cx="12" cy="8" r="4" /><path d="M4 20v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" /></svg></span>
          {t.title || 'Profil'}
        </h1>
        {params.err && (
          <div className="mb-4 text-red-600 text-center font-medium">{params.err}</div>
        )}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">{t.email || 'Email'}</span>
                  <p className="text-base text-gray-800">{korisnik.email}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">{t.name || 'Ime'}</span>
                  <p className="text-base text-gray-800">{korisnik.ime}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">{t.surname || 'Prezime'}</span>
                  <p className="text-base text-gray-800">{korisnik.prezime}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">{t.phone || 'Telefon'}</span>
                  <p className="text-base text-gray-800">{korisnik.telefon}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">{t.role || 'Uloga'}</span>
                  <p className="text-base text-gray-800">{korisnik.uloga}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">{t.address || 'Adresa'}</span>
                  <p className="text-base text-gray-800">{korisnik.adresa}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">{t.city || 'Grad'}</span>
                  <p className="text-base text-gray-800">{korisnik.grad}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">{t.country || 'Država'}</span>
                  <p className="text-base text-gray-800">{korisnik.podaciPreuzimanja?.drzava || ''}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">{t.postal_code || 'Poštanski broj'}</span>
                  <p className="text-base text-gray-800">{korisnik.postanskiBroj}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t">
                  <a
                    href="/profil/edit"
                    className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-base font-medium"
                  >
                    <FaEdit />
                    {t['edit_profile'] || 'Izmeni profil'}
                  </a>
                  <form action={handleDeleteKorisnik} className="flex-1">
                    <button
                      type="submit"
                      className="w-full bg-red-600 text-white px-4 py-3 rounded-lg shadow-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-base font-medium"
                    >
                      <FaTrash />
                      {t['obrisi_korisnika'] || 'Obriši korisnika'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}