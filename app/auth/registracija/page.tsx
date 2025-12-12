'use client';

import React, { useState, useEffect } from 'react';
import i18next, { i18n as I18nType } from 'i18next';
import { korisnikSchema } from '../../../zod';
import { useRouter, useSearchParams } from 'next/navigation';
import en from '../../../i18n/locales/en/auth.json';
import sr from '../../../i18n/locales/sr/auth.json';
import { FaUserPlus, FaEnvelope, FaLock, FaUser } from "react-icons/fa";

const resources = {
  en: { auth: en },
  sr: { auth: sr }
};

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  let lng = 'sr';
  const langParam = searchParams.get('lang');
  if (langParam === 'sr' || langParam === 'en') {
    lng = langParam;
  }
  const errorParam = searchParams.get('error');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState({
    email: '',
    lozinka: '',
    potvrdaLozinke: '',
    ime: '',
    prezime: ''
  });

  const [i18nInstance, setI18nInstance] = useState<I18nType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const instance = i18next.createInstance();
    instance.init({
      lng,
      fallbackLng: 'sr',
      resources,
      ns: ['auth'],
      defaultNS: 'auth',
      backend: false,
    }).then(() => {
      setI18nInstance(instance);
      setLoading(false);
    });
  }, [lng]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  if (loading || !i18nInstance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <span>Loading...</span>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const t = i18nInstance.t.bind(i18nInstance);
    const schema = korisnikSchema(t);

    const result = schema.safeParse(values);
    const newErrors: Record<string, string> = {};
    if (!result.success) {
      for (const err of result.error.issues) {
        newErrors[String(err.path[0])] = err.message;
      }
      if (values.lozinka !== values.potvrdaLozinke) {
        newErrors.potvrdaLozinke = t('passwords_do_not_match');
      }
      setErrors(newErrors);
      return;
    }
    if (values.lozinka !== values.potvrdaLozinke) {
      newErrors.potvrdaLozinke = t('passwords_do_not_match');
      setErrors(newErrors);
      return;
    }
    // ...submit logic here...
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[#f7f8fa]">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 text-gray-900">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center justify-center gap-2 text-center text-blue-600">
          <FaUserPlus className="text-blue-600" />
          {i18nInstance.t('register.title')}
        </h1>
        {errorParam === 'email_exists' && (
          <div className="mb-4 text-red-600 text-center font-medium">
            {i18nInstance.t('register.email_exists') || 'Email je već registrovan.'}
          </div>
        )}
        {errorParam && errorParam !== 'email_exists' && (
          <div className="mb-4 text-red-600 text-center font-medium">
            {i18nInstance.t('register.error_occurred') || 'Došlo je do greške pri registraciji.'}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg bg-white">
            <FaEnvelope className="text-blue-600 text-lg shrink-0" />
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400 text-gray-900 placeholder-gray-400"
              placeholder={i18nInstance.t('register.email')}
              value={values.email}
              onChange={handleChange}
            />
          </div>
          {errors.email && <div className="text-red-600 text-sm">{errors.email}</div>}
          <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg bg-white">
            <FaUser className="text-blue-600 text-lg shrink-0" />
            <input
              id="ime"
              name="ime"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400 text-gray-900 placeholder-gray-400"
              placeholder={i18nInstance.t('register.name')}
              value={values.ime}
              onChange={handleChange}
            />
          </div>
          {errors.ime && <div className="text-red-600 text-sm">{errors.ime}</div>}
          <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg bg-white">
            <FaUser className="text-blue-600 text-lg shrink-0" />
            <input
              id="prezime"
              name="prezime"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400 text-gray-900 placeholder-gray-400"
              placeholder={i18nInstance.t('register.surname')}
              value={values.prezime}
              onChange={handleChange}
            />
          </div>
          {errors.prezime && <div className="text-red-600 text-sm">{errors.prezime}</div>}
          <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg bg-white">
            <FaLock className="text-blue-600 text-lg shrink-0" />
            <input
              id="lozinka"
              name="lozinka"
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400 text-gray-900 placeholder-gray-400"
              placeholder={i18nInstance.t('register.password')}
              value={values.lozinka}
              onChange={handleChange}
            />
          </div>
          {errors.lozinka && <div className="text-red-600 text-sm">{errors.lozinka}</div>}
          <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg bg-white">
            <FaLock className="text-blue-600 text-lg shrink-0" />
            <input
              id="potvrdaLozinke"
              name="potvrdaLozinke"
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400 text-gray-900 placeholder-gray-400"
              placeholder={i18nInstance.t('register.confirm_password')}
              value={values.potvrdaLozinke}
              onChange={handleChange}
            />
          </div>
          {errors.potvrdaLozinke && <div className="text-red-600 text-sm">{errors.potvrdaLozinke}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {i18nInstance.t('register.submit')}
          </button>
        </form>
        <div className="mt-6 text-center border-t pt-4">
          <p className="text-gray-600 text-sm">
            {i18nInstance.t('register.haveAccount')}{' '}
            <a
              href="/auth/prijava"
              className="text-blue-600 hover:text-blue-800 font-medium underline transition-colors"
            >
              {i18nInstance.t('register.loginHere')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}