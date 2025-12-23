import { korisnikSchema } from '../.././../schemas';
import { redirect } from 'next/navigation';
import en from '../../../public/locales/en/auth.json';
import sr from '../../../public/locales/sr/auth.json';
import ClientLayout from '@/app/components/ClientLayout';
import RegistracijaForm from './RegistracijaForm';



export default async function RegistracijaPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {

  const params = await searchParams;
  let lng = 'sr';
  if (params?.lang === 'sr' || params?.lang === 'en') {
    lng = params.lang as string;
  }
  const errorParam = params?.error as string | undefined;
  const successParam = params?.success as string | undefined;
  const successEmail = params?.email as string | undefined;

  const tAuth = lng === 'en' ? en : sr;

  const initialValues = {
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
    const tAuth = lang === 'en' ? en : sr;
    const t = (key: string) => (tAuth.register as Record<string, string>)[key] ?? key;

    const values = {
      email: formData.get('email') as string,
      ime: formData.get('ime') as string,
      prezime: formData.get('prezime') as string,
      lozinka: formData.get('lozinka') as string,
      potvrdaLozinke: formData.get('potvrdaLozinke') as string,
    };

    const schema = korisnikSchema(t).pick({ email: true, ime: true, prezime: true, lozinka: true });
    const result = schema.safeParse(values);

    if (!result.success) {
      const params = new URLSearchParams();
      params.append('lang', lang);
      result.error.issues.forEach((err) => {
        if (err.path[0]) params.append(`err_${String(err.path[0])}`, err.message);
      });
      Object.entries(values).forEach(([k, v]) => params.append(`val_${k}`, v ?? ''));
      redirect(`/auth/registracija?${params.toString()}`);
    }

    if (values.lozinka !== values.potvrdaLozinke) {
      const params = new URLSearchParams();
      params.append('lang', lang);
      params.append('err_potvrdaLozinke', t('passwords_do_not_match') || 'Lozinke se ne poklapaju');
      Object.entries(values).forEach(([k, v]) => params.append(`val_${k}`, v ?? ''));
      redirect(`/auth/registracija?${params.toString()}`);
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
      redirect(`/auth/registracija?lang=${lang}&success=true&email=${encodeURIComponent(values.email)}`);
    } else if (data.error === 'email_exists') {
      redirect(`/auth/registracija?lang=${lang}&error=email_exists`);
    } else {
      redirect(`/auth/registracija?lang=${lang}&error=1`);
    }
  }

  const errorMap: Record<string, string> = {};
  const valueMap: Record<string, string> = {};

  if (typeof params === 'object' && params) {
    Object.entries(params).forEach(([k, v]) => {
      if (k.startsWith('err_')) errorMap[k.replace('err_', '')] = v as string;
      if (k.startsWith('val_')) valueMap[k.replace('val_', '')] = v as string;
    });
  }

  const translations = tAuth.register as Record<string, string>;


  return (
    <ClientLayout lang={lng}>
      <RegistracijaForm
        handleSubmit={handleSubmit}
        initialValues={initialValues}
        errorMap={errorMap}
        valueMap={valueMap}
        translations={translations}
        lang={lng}
        errorParam={errorParam}
        successParam={successParam}
        successEmail={successEmail}
      />
    </ClientLayout>
  );
}