/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import i18next, { i18n as I18nType } from 'i18next';
import { useRouter, useSearchParams } from 'next/navigation';
import en from '../../../i18n/locales/en/auth.json';
import sr from '../../../i18n/locales/sr/auth.json';
import { FaSignInAlt, FaEnvelope, FaLock } from "react-icons/fa";
import { FaGoogle } from "react-icons/fa";
import { signIn } from "next-auth/react";

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
    lozinka: ''
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    // Simple validation
    const newErrors: Record<string, string> = {};
    if (!values.email) newErrors.email = i18nInstance?.t('login.email_required') || 'Email je obavezan.';
    if (!values.lozinka) newErrors.lozinka = i18nInstance?.t('login.password_required') || 'Lozinka je obavezna.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // API poziv za login
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });
    const data = await res.json();
    if (data.success) {
      router.push('/');
    } else {
      setErrors({ general: i18nInstance?.t('login.invalidCredentials') || 'Pogrešan email ili lozinka.' });
    }
  };

  if (loading || !i18nInstance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center justify-center gap-2 text-center text-blue-600 dark:text-blue-600">
          <FaSignInAlt className="text-blue-600" />
          {i18nInstance.t('login.title')}
        </h1>
        {errors.general && (
          <div className="mb-4 text-red-600 text-center font-medium">
            {errors.general}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg hover:border-blue-400 transition-colors">
            <FaEnvelope className="text-blue-600 text-lg shrink-0" />
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md input-focus hover:border-blue-400 transition-colors !input-focus!ring-0 text-gray-900 dark:text-black placeholder-gray-400"
              placeholder={i18nInstance.t('login.email')}
              value={values.email}
              onChange={handleChange}
            />
          </div>
          {errors.email && <div className="text-red-600 text-sm">{errors.email}</div>}
          <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg hover:border-blue-400 transition-colors">
            <FaLock className="text-blue-600 text-lg shrink-0" />
            <input
              id="lozinka"
              name="lozinka"
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md input-focus hover:border-blue-400 transition-colors !input-focus!ring-0 text-gray-900 dark:text-black placeholder-gray-400"
              placeholder={i18nInstance.t('login.password')}
              value={values.lozinka}
              onChange={handleChange}
            />
          </div>
          {errors.lozinka && <div className="text-red-600 text-sm">{errors.lozinka}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {i18nInstance.t('login.button') || 'Prijavi se'}
          </button>
        </form>
        <div className="my-6 flex items-center justify-center">
          <button
        type="button"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
        onClick={() => signIn("google", { callbackUrl: "/" })}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24" height="24"><path fill="#4285F4" d="M24 9.5c3.54 0 6.73 1.22 9.24 3.22l6.93-6.93C36.36 2.34 30.55 0 24 0 14.64 0 6.27 5.7 2.13 14.02l8.06 6.27C12.7 13.16 17.89 9.5 24 9.5z" /><path fill="#34A853" d="M46.1 24.5c0-1.64-.15-3.22-.43-4.75H24v9.02h12.44c-.54 2.92-2.17 5.39-4.62 7.05l7.19 5.59C43.73 37.36 46.1 31.44 46.1 24.5z" /><path fill="#FBBC05" d="M10.19 28.29c-.47-1.41-.74-2.91-.74-4.54s.27-3.13.74-4.54l-8.06-6.27C.74 16.84 0 20.29 0 24c0 3.71.74 7.16 2.13 10.06l8.06 6.27z" /><path fill="#EA4335" d="M24 48c6.55 0 12.36-2.17 16.62-5.91l-7.19-5.59c-2.01 1.35-4.59 2.15-7.43 2.15-6.11 0-11.3-3.66-13.81-8.79l-8.06 6.27C6.27 42.3 14.64 48 24 48z" /></svg>
        Prijavi se putem Google-a
      </button>
        </div>
        <div className="mt-6 text-center border-t pt-4">
          <p className="text-gray-600 text-sm">
            {i18nInstance.t('login.noAccount')}{' '}
            <a
              href="/auth/registracija"
              className="text-blue-600 hover:text-blue-800 font-medium underline transition-colors"
            >
              {i18nInstance.t('login.registerHere')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

