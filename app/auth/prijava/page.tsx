import { cookies } from 'next/headers';
import LoginForm from '@/app/components/LoginForm';
import Link from 'next/link';

export default async function PrijavaPage() {
  // Server-side: učitaj prevode
  const cookieStore = await cookies();
  const lang = cookieStore.get('lang')?.value || 'sr';

  const authMessages = (await import(`@/i18n/locales/${lang}/auth.json`)).default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {authMessages.login.title}
            </h1>
            <p className="text-gray-600">
              {authMessages.login.noAccount}{' '}
              <Link href="/auth/registracija" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                {authMessages.login.registerHere}
              </Link>
            </p>
          </div>

          {/* Form */}
          <LoginForm translations={authMessages.login} />
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          © 2024 WebShop. All rights reserved.
        </p>
      </div>
    </div>
  );
}

