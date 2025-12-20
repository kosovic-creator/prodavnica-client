import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import ClientLayout from '@/app/components/ClientLayout';
import PrijavaForm from './PrijavaForm';

import sr from '@/i18n/locales/sr/auth.json';
import en from '@/i18n/locales/en/auth.json';

interface PrijavaPageProps {
  searchParams: Promise<{ lang?: string }>;
}

export default async function PrijavaPage({ searchParams }: PrijavaPageProps) {
  const params = await searchParams;
  const lang = params?.lang === 'en' ? 'en' : 'sr';
  const t = lang === 'en' ? en : sr;

  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user;
  const korisnikIme = typeof session?.user?.name === 'string' ? session.user.name : undefined;

  return (
    <ClientLayout lang={lang} isLoggedIn={isLoggedIn} korisnikIme={korisnikIme}>
      <PrijavaForm lang={lang} translations={t.login} />
    </ClientLayout>
  );
}

