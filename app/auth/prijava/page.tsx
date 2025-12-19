import { cookies } from 'next/headers';
import LoginForm from './LoginForm';
import Link from 'next/link';
import getTranslations from '@/lib/i18n';

interface PrijavaPageProps {
  searchParams: Promise<{ lang?: string }>;
}

export default async function PrijavaPage({ searchParams }: PrijavaPageProps) {
  const params = await searchParams;
  const langFromUrl = params.lang;

  // Don't try to set cookies directly in server components
  // The middleware will handle setting the cookie based on URL params
  const cookieStore = await cookies();
  const currentLang = langFromUrl || cookieStore.get('lang')?.value || 'sr';

  const authMessages = await getTranslations(currentLang, 'auth');

  return (
    <div key={currentLang} className="min-h-screen flex items-center justify-center bg-white px-4 py-8">
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
                href={`/auth/registracija?lang=${currentLang}`}
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

