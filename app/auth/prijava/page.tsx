/* eslint-disable @typescript-eslint/no-unused-vars */

import LoginForm from '../../components/LoginForm';
import i18next from 'i18next';
import { korisnikSchema } from '../../../zod';
import { redirect } from 'next/navigation';
import en from '../../../public/locales/en/auth.json';
import sr from '../../../public/locales/sr/auth.json';
import { FaSignInAlt, FaEnvelope, FaLock, FaGoogle } from "react-icons/fa";

const resources = {
  en: { auth: en },
  sr: { auth: sr }
};




export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  let lng = 'sr';
  if (params?.lang === 'sr' || params?.lang === 'en') {
    lng = params.lang as string;
  }
  const errorParam = params?.error;

  const i18nInstance = i18next.createInstance();
  await i18nInstance.init({
    lng,
    fallbackLng: 'sr',
    resources,
    ns: ['auth'],
    defaultNS: 'auth',
  });

  const errors: Record<string, string> = {};
  const values: Record<string, string> = {
    email: '',
    lozinka: ''
  };

  // Uklanjam server action, prikazujem klijentsku LoginForm komponentu

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center justify-center gap-2 text-center">
          <FaSignInAlt className="text-blue-600" />
          {i18nInstance.t('login.title')}
        </h1>
        {errorParam && (
          <div className="mb-4 text-red-600 text-center font-medium">
            {i18nInstance.t('login.invalidCredentials') || 'Pogrešan email ili lozinka.'}
          </div>
        )}
        {/* Klijentska login forma */}
        <div className="mt-4">
          <LoginForm />
        </div>
        {/* <div className="mt-6 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{i18nInstance.t('login.orContinueWith')}</span>
            </div>
          </div> */}
          {/* <form method="post" action="/api/auth/signin/google"> */}
            {/* <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-blue-500 text-white px-4 py-3 rounded-lg shadow-md hover:bg-blue-900 transition-colors text-base font-medium cursor-pointer"
            >
              <FaGoogle className="google-icon text-red-400" />
              {i18nInstance.t('login.continueWithGoogle')}
            </button> */}
          {/* </form> */}
        {/* </div> */}
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

