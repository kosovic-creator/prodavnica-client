/* eslint-disable @typescript-eslint/no-unused-vars */

import LoginForm from '../../components/LoginForm';
import i18next from 'i18next';
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

