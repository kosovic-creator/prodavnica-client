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
import { FaUser } from 'react-icons/fa';
import React from 'react';
import { revalidatePath } from 'next/cache';
import EditProfilForm from './EditProfilForm';


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
      Object.entries(form).forEach(([k, v]) => params.append(`val_${k}`, v ?? ''));
      redirect(`/profil/edit?lang=${lang}&${params.toString()}`);
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
      redirect(`/profil/edit?lang=${lang}&${params.toString()}`);
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
      redirect(`/profil/edit?lang=${lang}&${params.toString()}`);
    }
    revalidatePath('/profil');
    redirect('/profil');
  }

  const errorMap: Record<string, string> = {};
  const valueMap: Record<string, string> = {};
  if (typeof params === 'object' && params) {
    Object.entries(params).forEach(([k, v]) => {
      if (k.startsWith('err_')) errorMap[k.replace('err_', '')] = v as string;
      if (k.startsWith('val_')) valueMap[k.replace('val_', '')] = v as string;
    });
  }

  const translations = { ...tProfil, ...tKorisnici };

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
        <EditProfilForm
          handleEditProfil={handleEditProfil}
          initialForm={initialForm}
          errorMap={errorMap}
          valueMap={valueMap}
          translations={translations}
          lang={lang}
        />
      </div>
    </div>
  );
}