import i18next from 'i18next';
import { redirect } from 'next/navigation';
import en from '../../../public/locales/en/auth.json';
import sr from '../../../public/locales/sr/auth.json';
import { FaLock } from 'react-icons/fa';

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
  const successParam = params?.success;

  const i18nInstance = i18next.createInstance();
  await i18nInstance.init({
    lng,
    fallbackLng: 'sr',
    resources,
    ns: ['auth'],
    defaultNS: 'auth',
  });

  // Server action za reset lozinke
  async function handleSubmit(formData: FormData) {
    'use server';
    const email = formData.get('email') as string;
    // Pozovi API za reset lozinke
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/reset-lozinke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (data.success) {
      redirect('/auth/reset-lozinke?success=1');
    } else {
      redirect('/auth/reset-lozinke?error=1');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center justify-center gap-2 text-center">
          <FaLock className="text-blue-600" />
          {i18nInstance.t('reset.title') || 'Reset lozinke'}
        </h1>
        {successParam && (
          <div className="mb-4 text-green-600 text-center font-medium">
            {i18nInstance.t('reset.success') || 'Na vaš email je poslat link za reset lozinke.'}
          </div>
        )}
        {errorParam && (
          <div className="mb-4 text-red-600 text-center font-medium">
            {i18nInstance.t('reset.error') || 'Došlo je do greške. Provjerite email.'}
          </div>
        )}
        <form action={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg input-focus">
            <FaLock className="text-blue-600 text-lg shrink-0" />
            <input
              type="email"
              name="email"
              placeholder={i18nInstance.t('reset.email') || 'Email'}
              className="flex-1 outline-none bg-transparent text-base"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {i18nInstance.t('reset.submit') || 'Pošalji link za reset'}
          </button>
        </form>
      </div>
    </div>
  );
}
