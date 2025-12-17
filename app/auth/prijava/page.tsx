import { cookies } from 'next/headers';
import LoginForm from '@/app/components/LoginForm';
import Link from 'next/link';

export default async function PrijavaPage() {
  // Server-side: učitaj prevode
  const cookieStore = await cookies();
  const lang = cookieStore.get('lang')?.value || 'sr';

  const authMessages = (await import(`@/i18n/locales/${lang}/auth.json`)).default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {authMessages.login.title}
            </h1>
          </div>

          {/* Form */}
          <LoginForm translations={authMessages.login} />

          {/* Register Link - na dnu forme */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {authMessages.login.noAccount}{' '}
              <Link
                href="/auth/registracija"
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
              >
                {authMessages.login.registerHere}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

