import i18next from 'i18next';
import { korisnikSchema } from '../.././../schemas';
import { redirect } from 'next/navigation';
import en from '../../../public/locales/en/auth.json';
import sr from '../../../public/locales/sr/auth.json';
import { FaUserPlus, FaEnvelope, FaLock, FaUser } from "react-icons/fa";

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
    backend: false, // onemogući backend loader za SSR
  });

  const errors: Record<string, string> = {};
  const values: Record<string, string> = {
    email: '',
    ime: '',
    prezime: '',
    lozinka: '',
    potvrdaLozinke: ''
  };

  // Server action za validaciju i submit
  async function handleSubmit(formData: FormData) {
    'use server';
    const lang = (formData.get('lang') as string) || 'sr';
    const i18nInstance = (await import('i18next')).default.createInstance();
    await i18nInstance.init({
      lng: lang,
      fallbackLng: 'sr',
      resources,
      ns: ['auth'],
      defaultNS: 'auth',
      backend: false,
    });
    const t = (key: string) => i18nInstance.t(`register.${key}`);
    const values = {
      email: formData.get('email') as string,
      ime: formData.get('ime') as string,
      prezime: formData.get('prezime') as string,
      lozinka: formData.get('lozinka') as string,
      potvrdaLozinke: formData.get('potvrdaLozinke') as string,
    };
    const schema = korisnikSchema(t).pick({ email: true, ime: true, prezime: true, lozinka: true });
    const result = schema.safeParse(values);
    const errors: Record<string, string> = {};
    if (!result.success) {
      for (const err of result.error.issues) {
        errors[String(err.path[0])] = err.message;
      }
      if (values.lozinka !== values.potvrdaLozinke) {
        errors.potvrdaLozinke = t('passwords_do_not_match');
      }
      return;
    }
    if (values.lozinka !== values.potvrdaLozinke) {
      errors.potvrdaLozinke = t('passwords_do_not_match');
      return;
    }
    // Upis korisnika u bazu preko API poziva
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/korisnici`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: values.email,
        lozinka: values.lozinka,
        ime: values.ime,
        prezime: values.prezime
      })
    });
    const data = await res.json();
    if (data.success) {
      redirect('/auth/prijava');
    } else if (data.error === 'email_exists') {
      redirect('/auth/registracija?error=email_exists');
    } else {
      redirect('/auth/registracija?error=1');
    }
    const errorParam = params?.error;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center justify-center gap-2 text-center">
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
        <form action={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg hover:border-blue-400 transition-colors">
            <FaEnvelope className="text-blue-600 text-lg shrink-0" />
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md input-focus hover:border-blue-400 transition-colors !input-focus!ring-0"
              placeholder={i18nInstance.t('register.email')}
              defaultValue={values.email}
            />
          </div>
          {errors.email && <div className="text-red-600 text-sm">{errors.email}</div>}
          <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg hover:border-blue-400 transition-colors">
            <FaUser className="text-blue-600 text-lg shrink-0" />
            <input
              id="ime"
              name="ime"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md input-focus hover:border-blue-400 transition-colors !input-focus!ring-0"
              placeholder={i18nInstance.t('register.name')}
              defaultValue={values.ime}
            />
          </div>
          {errors.ime && <div className="text-red-600 text-sm">{errors.ime}</div>}
          <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg hover:border-blue-400 transition-colors">
            <FaUser className="text-blue-600 text-lg shrink-0" />
            <input
              id="prezime"
              name="prezime"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md input-focus hover:border-blue-400 transition-colors !input-focus!ring-0"
              placeholder={i18nInstance.t('register.surname')}
              defaultValue={values.prezime}
            />
          </div>
          {errors.prezime && <div className="text-red-600 text-sm">{errors.prezime}</div>}
          <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg hover:border-blue-400 transition-colors">
            <FaLock className="text-blue-600 text-lg shrink-0" />
            <input
              id="lozinka"
              name="lozinka"
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md input-focus hover:border-blue-400 transition-colors !input-focus!ring-0"
              placeholder={i18nInstance.t('register.password')}
              defaultValue={values.lozinka}
            />
          </div>
          {errors.lozinka && <div className="text-red-600 text-sm">{errors.lozinka}</div>}
          <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg hover:border-blue-400 transition-colors">
            <FaLock className="text-blue-600 text-lg shrink-0" />
            <input
              id="potvrdaLozinke"
              name="potvrdaLozinke"
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md input-focus hover:border-blue-400 transition-colors !input-focus!ring-0"
              placeholder={i18nInstance.t('register.confirm_password')}
              defaultValue={values.potvrdaLozinke}
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
      </div>
    </div>
  );
}