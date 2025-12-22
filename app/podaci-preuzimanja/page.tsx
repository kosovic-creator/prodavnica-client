import { getServerSession } from 'next-auth';
import { Suspense } from 'react';
// SuccessRedirect je client komponenta
import SuccessRedirect from './SuccessRedirect';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { getPodaciPreuzimanja, createPodaciPreuzimanja, updatePodaciPreuzimanja } from '@/lib/actions/podaci-preuzimanja';
import { ocistiKorpu } from '@/lib/actions/korpa';
import { revalidatePath } from 'next/cache';
import srJson from '@/i18n/locales/sr/podaci-preuzimanja.json';
import enJson from '@/i18n/locales/en/podaci-preuzimanja.json';
import ClientLayout from '../components/ClientLayout';

const sr: Record<string, string> = srJson;
const en: Record<string, string> = enJson;

import { cookies } from 'next/headers';
import { getServerSession as getSession } from 'next-auth';
import { z } from 'zod';

function getT(lang: string) {
  const t = lang === 'en' ? en : sr;
  return (key: string) => t[key] || key;
}

export default async function PodaciPreuzimanjaPage({ searchParams }: { searchParams?: Promise<{ lang?: string; error?: string; success?: string }> | { lang?: string; error?: string; success?: string } }) {
  let lang = 'sr';
  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  if (params) {
    if (typeof params === 'object' && params.lang === 'en') {
      lang = 'en';
    }
  }
  const t = getT(lang);

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/auth/prijava');
  }
  const userId = session.user.id;

  const result = await getPodaciPreuzimanja(userId);
  const podaci = result.success && result.data ? result.data : null;

  function getFormStateFromParams(params: { lang?: string; error?: string; success?: string } | undefined) {
    let error: Record<string, string[]> | { global?: string } = {};
    let success = false;
    if (params?.error) {
      try {
        error = JSON.parse(params.error);
      } catch { }
    }
    if (params?.success === '1') success = true;
    return { error, success };
  }
  const formState = getFormStateFromParams(params);

  function isFieldErrors(error: Record<string, string[]> | { global?: string }): error is Record<string, string[]> {
    return !('global' in error);
  }

  async function handleSubmit(formData: FormData) {
    'use server';
    const session = await getSession(authOptions);
    if (!session?.user?.id) {
      redirect('/auth/prijava');
    }
    const userId = session.user.id;
    let lang = 'sr';
    const cookieStore = await cookies();
    const nextLang = cookieStore.get('NEXT_LOCALE')?.value;
    if (nextLang === 'en') lang = 'en';
    const t = getT(lang);
    const podaciSchema = z.object({
      adresa: z.string().min(2, t('adresa_error') || 'Adresa je obavezna'),
      drzava: z.string().min(2, t('drzava_error') || 'Država je obavezna'),
      grad: z.string().min(2, t('grad_error') || 'Grad je obavezan'),
      postanskiBroj: z.string().min(2, t('postanskiBroj_error') || 'Poštanski broj je obavezan'),
      telefon: z.string().min(5, t('telefon_error') || 'Telefon je obavezan').max(20).regex(/^\+?[0-9\s]*$/, t('telefon_error') || 'Telefon nije validan'),
    });
    const values = {
      adresa: formData.get('adresa')?.toString() || '',
      drzava: formData.get('drzava')?.toString() || '',
      grad: formData.get('grad')?.toString() || '',
      postanskiBroj: formData.get('postanskiBroj')?.toString() || '',
      telefon: formData.get('telefon')?.toString() || '',
    };
    const parsed = podaciSchema.safeParse(values);
    if (!parsed.success) {
      const error = encodeURIComponent(JSON.stringify(parsed.error.flatten().fieldErrors));
      redirect(`/podaci-preuzimanja?error=${error}`);
    }
    const resultCheck = await getPodaciPreuzimanja(userId);
    let result;
    if (resultCheck.success && resultCheck.data) {
      result = await updatePodaciPreuzimanja(userId, {
        ...parsed.data,
        postanskiBroj: Number(parsed.data.postanskiBroj),
      });
    } else {
      result = await createPodaciPreuzimanja(userId, {
        ...parsed.data,
        postanskiBroj: Number(parsed.data.postanskiBroj),
      });
    }
    revalidatePath('/podaci-preuzimanja');
    if (!result.success) {
      const error = encodeURIComponent(JSON.stringify({ global: result.error }));
      redirect(`/podaci-preuzimanja?error=${error}`);
    }
    await ocistiKorpu(userId);
    redirect('/podaci-preuzimanja?success=1');
  }

  return (
    <ClientLayout lang={lang} isLoggedIn={!!session?.user} korisnikIme={typeof session?.user?.name === 'string' ? session.user.name : undefined}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            {t('naslov')}
          </h2>
          {formState.success && (
            <Suspense fallback={null}>
              <SuccessRedirect message={t('uspjeh') || 'Podaci su uspješno sačuvani!'} />
            </Suspense>
          )}
          {formState.error?.global && (
            <div className="mb-4 p-3 rounded bg-red-100 text-red-800 text-center">
              {formState.error.global}
            </div>
          )}
          <form action={handleSubmit} className="space-y-4">
            <input
              name="adresa"
              defaultValue={podaci?.adresa || ''}
              placeholder={t('adresa')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
              aria-invalid={!!(isFieldErrors(formState.error) && formState.error?.adresa)}
              aria-describedby="adresa-error"
            />
            {isFieldErrors(formState.error) && formState.error?.adresa && Array.isArray(formState.error.adresa) && (
              <p id="adresa-error" className="text-red-600 text-sm mt-1">{formState.error.adresa.join(', ')}</p>
            )}
            <input
              name="drzava"
              defaultValue={podaci?.drzava || ''}
              placeholder={t('drzava')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
              aria-invalid={!!(isFieldErrors(formState.error) && formState.error?.drzava)}
              aria-describedby="drzava-error"
            />
            {isFieldErrors(formState.error) && formState.error?.drzava && Array.isArray(formState.error.drzava) && (
              <p id="drzava-error" className="text-red-600 text-sm mt-1">{formState.error.drzava.join(', ')}</p>
            )}
            <input
              name="grad"
              defaultValue={podaci?.grad || ''}
              placeholder={t('grad')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
              aria-invalid={!!(isFieldErrors(formState.error) && formState.error?.grad)}
              aria-describedby="grad-error"
            />
            {isFieldErrors(formState.error) && formState.error?.grad && Array.isArray(formState.error.grad) && (
              <p id="grad-error" className="text-red-600 text-sm mt-1">{formState.error.grad.join(', ')}</p>
            )}
            <input
              name="postanskiBroj"
              defaultValue={podaci?.postanskiBroj?.toString() || ''}
              placeholder={t('postanskiBroj')}
              type="number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
              aria-invalid={!!(isFieldErrors(formState.error) && formState.error?.postanskiBroj)}
              aria-describedby="postanskiBroj-error"
            />
            {isFieldErrors(formState.error) && formState.error?.postanskiBroj && Array.isArray(formState.error.postanskiBroj) && (
              <p id="postanskiBroj-error" className="text-red-600 text-sm mt-1">{formState.error.postanskiBroj.join(', ')}</p>
            )}
            <input
              name="telefon"
              defaultValue={podaci?.telefon || ''}
              placeholder={t('telefon')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
              aria-invalid={!!(isFieldErrors(formState.error) && formState.error?.telefon)}
              aria-describedby="telefon-error"
            />
            {isFieldErrors(formState.error) && formState.error?.telefon && Array.isArray(formState.error.telefon) && (
              <p id="telefon-error" className="text-red-600 text-sm mt-1">{formState.error.telefon.join(', ')}</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {t('sacuvaj_podatke')}
            </button>
          </form>
        </div>
      </div>
    </ClientLayout>
  );
}
