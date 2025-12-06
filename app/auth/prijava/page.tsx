
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

  const i18nInstance = i18next.createInstance();
  await i18nInstance.init({
    lng,
    fallbackLng: 'sr',
    resources,
    ns: ['auth'],
    defaultNS: 'auth',
  });

  // Pripremi sve stringove za login
  const t = (key: string) => i18nInstance.t(`login.${key}`);
  const loginStrings = {
    title: t('title'),
    email: t('email'),
    password: t('password'),
    login: t('login'),
    registerHere: t('registerHere'),
    noAccount: t('noAccount'),
    invalidCredentials: t('invalidCredentials'),
    logoutSuccess: t('logoutSuccess'),
    orContinueWith: t('orContinueWith'),
    loginWithGoogle: t('loginWithGoogle'),
    continueWithGoogle: t('continueWithGoogle'),
    rememberMe: t('rememberMe'),
    recentLogins: t('recentLogins'),
    selectAccount: t('selectAccount'),
    remove: t('remove'),
    loggingIn: t('loggingIn'),
    errorOccurred: t('errorOccurred'),
    errorLoadingRecent: t('errorLoadingRecent'),
    noRecentLogins: t('noRecentLogins'),
  };

  // Server-side forma bez interaktivnosti (za full SSR, bez localStorage i useState)
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center justify-center gap-2 text-center">
          <FaSignInAlt className="text-blue-600" />
          {loginStrings.title}
        </h1>
        <form method="post" action="/api/auth/signin" className="space-y-4">
          <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg input-focus">
            <FaEnvelope className="text-blue-600 text-lg shrink-0" />
            <input
              type="email"
              name="email"
              placeholder={loginStrings.email}
              className="flex-1 outline-none bg-transparent text-base"
              required
            />
          </div>
          <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg input-focus">
            <FaLock className="text-blue-600 text-lg shrink-0" />
            <input
              type="password"
              name="password"
              placeholder={loginStrings.password}
              className="flex-1 outline-none bg-transparent text-base"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-800 transition-colors">
              <div className="relative">
                <input
                  type="checkbox"
                  name="rememberMe"
                  className="sr-only"
                />
                <div className="w-4 h-4 border-2 rounded flex items-center justify-center transition-colors border-gray-300 hover:border-blue-400">
                </div>
                {loginStrings.rememberMe}
              </div>
            </label>
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors text-base font-medium cursor-pointer"
          >
            <FaSignInAlt />
            {loginStrings.login}
          </button>
        </form>
        <div className="mt-6 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{loginStrings.orContinueWith}</span>
            </div>
          </div>
          <form method="post" action="/api/auth/signin/google">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-blue-500 text-white px-4 py-3 rounded-lg shadow-md hover:bg-blue-900 transition-colors text-base font-medium cursor-pointer"
            >
              <FaGoogle className="google-icon text-red-400" />
              {loginStrings.continueWithGoogle}
            </button>
          </form>
        </div>
        <div className="mt-6 text-center border-t pt-4">
          <p className="text-gray-600 text-sm">
            {loginStrings.noAccount}{' '}
            <a
              href="/auth/registracija"
              className="text-blue-600 hover:text-blue-800 font-medium underline transition-colors"
            >
              {loginStrings.registerHere}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

