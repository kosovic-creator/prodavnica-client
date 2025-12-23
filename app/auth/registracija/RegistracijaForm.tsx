/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import SuccessMessage from '@/app/components/SuccessMessage';
import { korisnikSchema } from '@/schemas';
import RegistracijaFormSkeleton from './RegistracijaFormSkeleton';

interface RegistracijaFormProps {
  handleSubmit: (formData: FormData) => Promise<void>;
  initialValues: {
    email: string;
    ime: string;
    prezime: string;
    lozinka: string;
    potvrdaLozinke: string;
  };
  errorMap: Record<string, string>;
  valueMap: Record<string, string>;
  translations: Record<string, string>;
  lang: string;
  errorParam?: string;
  successParam?: string;
  successEmail?: string;
}

export default function RegistracijaForm({
  handleSubmit,
  initialValues,
  errorMap: serverErrorMap,
  valueMap,
  translations,
  lang,
  errorParam,
  successParam,
  successEmail
}: RegistracijaFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>(serverErrorMap);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (successParam === 'true') {
      const timer = setTimeout(() => {
        router.push(`/auth/prijava?lang=${lang}&email=${encodeURIComponent(successEmail || '')}`);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successParam, successEmail, lang, router]);

  const t = (key: string) => translations[key] || key;

  const validationSchema = korisnikSchema(t).pick({
    email: true,
    ime: true,
    prezime: true,
    lozinka: true
  }).extend({
    potvrdaLozinke: korisnikSchema(t).shape.lozinka
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
    } catch (error: unknown) {
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

    // Dodatna validacija za potvrdaLozinke
    if (name === 'potvrdaLozinke' || name === 'lozinka') {
      const form = e.target.form;
      if (form) {
        const lozinka = (form.elements.namedItem('lozinka') as HTMLInputElement)?.value;
        const potvrdaLozinke = (form.elements.namedItem('potvrdaLozinke') as HTMLInputElement)?.value;

        if (potvrdaLozinke && lozinka !== potvrdaLozinke) {
          setErrors(prev => ({ ...prev, potvrdaLozinke: t('passwords_do_not_match') || 'Lozinke se ne poklapaju' }));
        } else if (lozinka === potvrdaLozinke) {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.potvrdaLozinke;
            return newErrors;
          });
        }
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (touched[name]) {
      validateField(name, value);
    }

    // Real-time validacija za poklapanje lozinki
    if (name === 'potvrdaLozinke' || name === 'lozinka') {
      const form = e.target.form;
      if (form && touched.potvrdaLozinke) {
        const lozinka = (form.elements.namedItem('lozinka') as HTMLInputElement)?.value;
        const potvrdaLozinke = (form.elements.namedItem('potvrdaLozinke') as HTMLInputElement)?.value;

        if (potvrdaLozinke && lozinka !== potvrdaLozinke) {
          setErrors(prev => ({ ...prev, potvrdaLozinke: t('passwords_do_not_match') || 'Lozinke se ne poklapaju' }));
        } else if (lozinka === potvrdaLozinke) {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.potvrdaLozinke;
            return newErrors;
          });
        }
      }
    }
  };

  // Prikaži skeleton dok traje neka akcija
  if (isPending) {
    return <RegistracijaFormSkeleton />;
  }

  return (
    <div className="flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('title')}
            </h1>
          </div>

          {/* Success Message */}
          {successParam === 'true' && (
            <SuccessMessage message={t('register_success') || 'Uspešno ste se registrovali. Preusmeravanje na stranicu za prijavu...'} />
          )}

          {/* Error Messages */}
          {errorParam === 'email_exists' && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {t('email_exists') || 'Email je već registrovan.'}
            </div>
          )}
          {errorParam && errorParam !== 'email_exists' && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {t('error_occurred') || 'Došlo je do greške pri registraciji.'}
            </div>
          )}
          {errors.global && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {errors.global}
            </div>
          )}

          {/* Form */}
          <form action={handleSubmit} className="space-y-4">
            <input type="hidden" name="lang" value={lang} />

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder={t('email')}
                defaultValue={valueMap.email || initialValues.email}
                onBlur={handleBlur}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Name Input */}
            <div>
              <label htmlFor="ime" className="block text-sm font-medium text-gray-700 mb-1">
                {t('name')}
              </label>
              <input
                id="ime"
                name="ime"
                type="text"
                required
                placeholder={t('name')}
                defaultValue={valueMap.ime || initialValues.ime}
                onBlur={handleBlur}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                  errors.ime ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.ime && (
                <p className="mt-1 text-sm text-red-600">{errors.ime}</p>
              )}
            </div>

            {/* Surname Input */}
            <div>
              <label htmlFor="prezime" className="block text-sm font-medium text-gray-700 mb-1">
                {t('surname')}
              </label>
              <input
                id="prezime"
                name="prezime"
                type="text"
                required
                placeholder={t('surname')}
                defaultValue={valueMap.prezime || initialValues.prezime}
                onBlur={handleBlur}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                  errors.prezime ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.prezime && (
                <p className="mt-1 text-sm text-red-600">{errors.prezime}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="lozinka" className="block text-sm font-medium text-gray-700 mb-1">
                {t('password')}
              </label>
              <input
                id="lozinka"
                name="lozinka"
                type="password"
                required
                placeholder={t('password')}
                defaultValue={valueMap.lozinka || initialValues.lozinka}
                onBlur={handleBlur}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                  errors.lozinka ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.lozinka && (
                <p className="mt-1 text-sm text-red-600">{errors.lozinka}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="potvrdaLozinke" className="block text-sm font-medium text-gray-700 mb-1">
                {t('confirm_password')}
              </label>
              <input
                id="potvrdaLozinke"
                name="potvrdaLozinke"
                type="password"
                required
                placeholder={t('confirm_password')}
                defaultValue={valueMap.potvrdaLozinke || initialValues.potvrdaLozinke}
                onBlur={handleBlur}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                  errors.potvrdaLozinke ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.potvrdaLozinke && (
                <p className="mt-1 text-sm text-red-600">{errors.potvrdaLozinke}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2.5 rounded-md font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all"
            >
              {t('submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
