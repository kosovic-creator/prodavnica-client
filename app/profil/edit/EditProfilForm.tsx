/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';
import { z } from 'zod';
import srKorisnici from '@/i18n/locales/sr/korisnici.json';
import enKorisnici from '@/i18n/locales/en/korisnici.json';
import srProfil from '@/i18n/locales/sr/profil.json';
import enProfil from '@/i18n/locales/en/profil.json';

interface EditProfilFormProps {
  handleEditProfil: (formData: FormData) => Promise<void>;
  initialForm: {
    ime: string;
    prezime: string;
    email: string;
    telefon: string;
    drzava: string;
    grad: string;
    postanskiBroj: string;
    adresa: string;
    uloga: string;
    podaciId: string;
  };
  errorMap: Record<string, string>;
  valueMap: Record<string, string>;
  translations: Record<string, string>;
  lang: string;
}

export default function EditProfilForm({
  handleEditProfil,
  initialForm,
  errorMap: serverErrorMap,
  valueMap,
  translations,
  lang
}: EditProfilFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>(serverErrorMap);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const t = (key: string) => {
    const tKorisnici = lang === 'en' ? enKorisnici : srKorisnici;
    const tProfil = lang === 'en' ? enProfil : srProfil;
    return (tKorisnici as Record<string, string>)[key] ?? (tProfil as Record<string, string>)[key] ?? key;
  };

  const validationSchema = z.object({
    ime: z.string().min(1, "Ime je obavezno").min(2, "Ime mora imati najmanje 2 karaktera"),
    prezime: z.string().min(1, "Prezime je obavezno").min(2, "Prezime mora imati najmanje 2 karaktera"),
    email: z.string().min(1, "Email je obavezan").email("Neispravan email format"),
    telefon: z.string().min(1, "Telefon je obavezan").min(5, "Telefon mora imati najmanje 5 karaktera"),
    drzava: z.string().min(1, "Država je obavezna").min(2, "Država mora imati najmanje 2 karaktera"),
    grad: z.string().min(1, "Grad je obavezan").min(2, "Grad mora imati najmanje 2 karaktera"),
    postanskiBroj: z.string().min(1, "Poštanski broj je obavezan"),
    adresa: z.string().min(1, "Adresa je obavezna").min(3, "Adresa mora imati najmanje 3 karaktera"),
  });

  const validateField = (name: string, value: string) => {
    try {
      const fieldSchema = validationSchema.shape[name as keyof typeof validationSchema.shape];
      if (!fieldSchema) return;

      fieldSchema.parse(value);

      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        if (firstError?.message) {
          setErrors(prev => ({ ...prev, [name]: firstError.message }));
        }
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (touched[name]) {
      validateField(name, value);
    }
  };

  return (
    <form action={handleEditProfil} className="space-y-4 bg-white rounded-lg shadow-md p-6">
      <input type="hidden" name="podaciId" defaultValue={valueMap.podaciId || initialForm.podaciId} />
      <input type="hidden" name="uloga" value={valueMap.uloga || initialForm.uloga || 'korisnik'} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input
            name="ime"
            defaultValue={valueMap.ime || initialForm.ime}
            placeholder={translations.name || t('name')}
            onBlur={handleBlur}
            onChange={handleChange}
            className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 transition-all text-base ${
              errors.ime ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.ime && <div className="text-red-500 text-sm mt-1">{errors.ime}</div>}
        </div>
        <div>
          <input
            name="prezime"
            defaultValue={valueMap.prezime || initialForm.prezime}
            placeholder={translations.surname || t('surname')}
            onBlur={handleBlur}
            onChange={handleChange}
            className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 transition-all text-base ${
              errors.prezime ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.prezime && <div className="text-red-500 text-sm mt-1">{errors.prezime}</div>}
        </div>
      </div>

      <div>
        <input
          name="email"
          type="email"
          defaultValue={valueMap.email || initialForm.email}
          placeholder={translations.email || t('email')}
          onBlur={handleBlur}
          onChange={handleChange}
          className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 transition-all text-base ${
            errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
          }`}
        />
        {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
      </div>

      <div>
        <input
          name="telefon"
          defaultValue={valueMap.telefon || initialForm.telefon}
          placeholder={translations.phone || t('phone')}
          onBlur={handleBlur}
          onChange={handleChange}
          className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 transition-all text-base ${
            errors.telefon ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
          }`}
        />
        {errors.telefon && <div className="text-red-500 text-sm mt-1">{errors.telefon}</div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input
            name="drzava"
            defaultValue={valueMap.drzava || initialForm.drzava}
            placeholder={translations.country || t('country')}
            onBlur={handleBlur}
            onChange={handleChange}
            className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 transition-all text-base ${
              errors.drzava ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.drzava && <div className="text-red-500 text-sm mt-1">{errors.drzava}</div>}
        </div>
        <div>
          <input
            name="grad"
            defaultValue={valueMap.grad || initialForm.grad}
            placeholder={translations.city || t('city')}
            onBlur={handleBlur}
            onChange={handleChange}
            className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 transition-all text-base ${
              errors.grad ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.grad && <div className="text-red-500 text-sm mt-1">{errors.grad}</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input
            name="postanskiBroj"
            defaultValue={valueMap.postanskiBroj || initialForm.postanskiBroj}
            placeholder={translations.postal_code || t('postal_code')}
            onBlur={handleBlur}
            onChange={handleChange}
            className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 transition-all text-base ${
              errors.postanskiBroj ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.postanskiBroj && <div className="text-red-500 text-sm mt-1">{errors.postanskiBroj}</div>}
        </div>
        <div>
          <input
            name="adresa"
            defaultValue={valueMap.adresa || initialForm.adresa}
            placeholder={translations.address || t('address')}
            onBlur={handleBlur}
            onChange={handleChange}
            className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 transition-all text-base ${
              errors.adresa ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.adresa && <div className="text-red-500 text-sm mt-1">{errors.adresa}</div>}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-base font-medium"
        >
          <FaSave />
          {translations.sacuvaj_izmjene || t('sacuvaj_izmjene')}
        </button>
        <a
          href="/profil"
          className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 transition-colors flex items-center justify-center gap-2 text-base font-medium"
        >
          <FaTimes />
          {translations.odkazivanje || t('odkazivanje')}
        </a>
      </div>
    </form>
  );
}