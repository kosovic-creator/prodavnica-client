/* eslint-disable @typescript-eslint/no-explicit-any */

import { getServerSession } from 'next-auth';
import { getKorisnikById } from '@/lib/actions';
import { authOptions } from '@/lib/authOptions';
import srProfil from '@/i18n/locales/sr/profil.json';
import enProfil from '@/i18n/locales/en/profil.json';
import srKorisnici from '@/i18n/locales/sr/korisnici.json';
import enKorisnici from '@/i18n/locales/en/korisnici.json';

import { korisnikSchema } from '../.././../schemas';
import { updateProfilKorisnika, updatePodaciPreuzimanja, createPodaciPreuzimanja } from '@/lib/actions';
import { redirect } from 'next/navigation';
import { FaUser, FaSave, FaTimes } from 'react-icons/fa';
import React from 'react';
import { revalidatePath } from 'next/cache';


export default async function EditProfilPage({ searchParams }: { searchParams?: { [key: string]: string } | Promise<{ [key: string]: string }> }) {
  let params: { [key: string]: string } = {};
  if (searchParams) {
    if (typeof (searchParams as Promise<any>).then === 'function') {
      params = await (searchParams as Promise<any>);
    } else {
      params = searchParams as { [key: string]: string };
    }
  }
  const lang = params?.lang === 'en' ? 'en' : 'sr';
  const tProfil = lang === 'en' ? enProfil : srProfil;
  const tKorisnici = lang === 'en' ? enKorisnici : srKorisnici;
  const t = (key: string) => (tKorisnici as Record<string, string>)[key] ?? (tProfil as Record<string, string>)[key] ?? key;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/auth/prijava');
  }

  const result = await getKorisnikById(session.user.id);
  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {tProfil.error_fetch_korisnik || 'Greška pri učitavanju profila'}
      </div>
    );
  }

  const korisnik = result.data;
  const initialForm = {
    ime: korisnik.ime || '',
    prezime: korisnik.prezime || '',
    email: korisnik.email || '',
    telefon: korisnik.podaciPreuzimanja?.telefon || '',
    drzava: korisnik.podaciPreuzimanja?.drzava || '',
    grad: korisnik.podaciPreuzimanja?.grad || '',
    postanskiBroj: korisnik.podaciPreuzimanja?.postanskiBroj ? korisnik.podaciPreuzimanja.postanskiBroj.toString() : '',
    adresa: korisnik.podaciPreuzimanja?.adresa || '',
    uloga: korisnik.uloga || 'korisnik',
    podaciId: korisnik.podaciPreuzimanja?.id || '',
  };

  async function handleEditProfil(formData: FormData) {
    'use server';
    // rekonstruiši t unutar actiona
    const t = (key: string) => (tKorisnici as Record<string, string>)[key] ?? (tProfil as Record<string, string>)[key] ?? key;
    const form = {
      ime: formData.get('ime') as string,
      prezime: formData.get('prezime') as string,
      email: formData.get('email') as string,
      telefon: formData.get('telefon') as string,
      drzava: formData.get('drzava') as string,
      grad: formData.get('grad') as string,
      postanskiBroj: formData.get('postanskiBroj') as string,
      adresa: formData.get('adresa') as string,
      uloga: formData.get('uloga') as string,
      podaciId: formData.get('podaciId') as string,
    };
    const schema = korisnikSchema(t).omit({ lozinka: true, slika: true });
    const result = schema.safeParse(form);
    if (!result.success) {
      const params = new URLSearchParams();
      result.error.issues.forEach((err) => {
        if (err.path[0]) params.append(`err_${String(err.path[0])}`, err.message);
      });
      // preserve values
      Object.entries(form).forEach(([k, v]) => params.append(`val_${k}`, v ?? ''));
      redirect(`/profil/edit?${params.toString()}`);
    }
    const userId = session!.user.id;
    const korisnikResult = await updateProfilKorisnika(userId, {
      ime: form.ime,
      prezime: form.prezime,
      email: form.email,
      uloga: form.uloga,
    });
    if (!korisnikResult.success) {
      const params = new URLSearchParams();
      params.append('err_global', korisnikResult.error || t('greska_pri_cuvanju'));
      Object.entries(form).forEach(([k, v]) => params.append(`val_${k}`, v ?? ''));
      redirect(`/profil/edit?${params.toString()}`);
    }
    let podaciResult;
    if (form.podaciId) {
      podaciResult = await updatePodaciPreuzimanja(userId, {
        adresa: form.adresa,
        drzava: form.drzava,
        grad: form.grad,
        postanskiBroj: Number(form.postanskiBroj),
        telefon: form.telefon,
      });
    } else {
      podaciResult = await createPodaciPreuzimanja(userId, {
        adresa: form.adresa,
        drzava: form.drzava,
        grad: form.grad,
        postanskiBroj: Number(form.postanskiBroj),
        telefon: form.telefon,
      });
    }
    if (!podaciResult.success) {
      const params = new URLSearchParams();
      params.append('err_global', podaciResult.error || t('greska_pri_cuvanju'));
      Object.entries(form).forEach(([k, v]) => params.append(`val_${k}`, v ?? ''));
      redirect(`/profil/edit?${params.toString()}`);
    }
    revalidatePath('/profil');
    redirect('/profil');
  }

  // Prikupi greške i vrednosti iz params
  const errorMap: Record<string, string> = {};
  const valueMap: Record<string, string> = {};
  if (typeof params === 'object' && params) {
    Object.entries(params).forEach(([k, v]) => {
      if (k.startsWith('err_')) errorMap[k.replace('err_', '')] = v as string;
      if (k.startsWith('val_')) valueMap[k.replace('val_', '')] = v as string;
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2 text-center justify-center">
          <FaUser className="text-blue-600" />
          {t('title')}
        </h1>
        {errorMap.global && (
          <div className="mb-4 text-red-600 text-center font-medium">{errorMap.global}</div>
        )}
        <form action={handleEditProfil} className="space-y-4 bg-white rounded-lg shadow-md p-6">
          <input type="hidden" name="podaciId" defaultValue={valueMap.podaciId || initialForm.podaciId} />
          <input type="hidden" name="uloga" value={valueMap.uloga || initialForm.uloga || 'korisnik'} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                name="ime"
                defaultValue={valueMap.ime || initialForm.ime}
                placeholder={t('name')}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base"
              />
              {errorMap.ime && <div className="text-red-500 text-sm mt-1">{errorMap.ime}</div>}
            </div>
            <div>
              <input
                name="prezime"
                defaultValue={valueMap.prezime || initialForm.prezime}
                placeholder={t('surname')}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base"
              />
              {errorMap.prezime && <div className="text-red-500 text-sm mt-1">{errorMap.prezime}</div>}
            </div>
          </div>
          <div>
            <input
              name="email"
              defaultValue={valueMap.email || initialForm.email}
              placeholder={t('email')}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base"
            />
            {errorMap.email && <div className="text-red-500 text-sm mt-1">{errorMap.email}</div>}
          </div>
          <div>
            <input
              name="telefon"
              defaultValue={valueMap.telefon || initialForm.telefon}
              placeholder={t('phone')}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base"
            />
            {errorMap.telefon && <div className="text-red-500 text-sm mt-1">{errorMap.telefon}</div>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                name="drzava"
                defaultValue={valueMap.drzava || initialForm.drzava}
                placeholder={t('country')}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base"
              />
              {errorMap.drzava && <div className="text-red-500 text-sm mt-1">{errorMap.drzava}</div>}
            </div>
            <div>
              <input
                name="grad"
                defaultValue={valueMap.grad || initialForm.grad}
                placeholder={t('city')}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base"
              />
              {errorMap.grad && <div className="text-red-500 text-sm mt-1">{errorMap.grad}</div>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                name="postanskiBroj"
                defaultValue={valueMap.postanskiBroj || initialForm.postanskiBroj}
                placeholder={t('postal_code')}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base"
              />
              {errorMap.postanskiBroj && <div className="text-red-500 text-sm mt-1">{errorMap.postanskiBroj}</div>}
            </div>
            <div>
              <input
                name="adresa"
                defaultValue={valueMap.adresa || initialForm.adresa}
                placeholder={t('address')}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base"
              />
              {errorMap.adresa && <div className="text-red-500 text-sm mt-1">{errorMap.adresa}</div>}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-base font-medium"
            >
              <FaSave />
              {t('sacuvaj_izmjene')}
            </button>
            <a
              href="/profil"
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 transition-colors flex items-center justify-center gap-2 text-base font-medium"
            >
              <FaTimes />
              {t('odkazivanje')}
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}