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

    // prihvaća vrijednosti pola iz FomData koji su učitani u klientu i vrši validaciju radi slanja na server
    const values = {
      email: formData.get('email') as string,
      ime: formData.get('ime') as string,
      prezime: formData.get('prezime') as string,
      lozinka: formData.get('lozinka') as string,
      potvrdaLozinke: formData.get('potvrdaLozinke') as string,
    };
// provjerava podatke koristeći zod šemu
    const schema = korisnikSchema(t).pick({ email: true, ime: true, prezime: true, lozinka: true });
// izvršava sigurnu parsiranje podataka
    const result = schema.safeParse(values);
// ako validacija ne uspije, preusmjerava natrag na formu sa greškama i unesenim vrijednostima
    if (!result.success) {
      const params = new URLSearchParams();
      // dodaje na krajak jezik
      params.append('lang', lang);
      // dodaje greške validacije
      result.error.issues.forEach((err) => {
        if (err.path[0]) params.append(`err_${String(err.path[0])}`, err.message);
      });
      // dodaje unesene vrijednosti za ponovni unos
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
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/registracija`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // slanje validiranih podataka kao JSON u tijelu zahtjeva
      body: JSON.stringify({
        email: values.email,
        lozinka: values.lozinka,
        ime: values.ime,
        prezime: values.prezime
      })
    });
// dohvaćanje odgovora iz API-ja
    const data = await res.json();

    // preusmjeravanje na osnovu rezultata registracije
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