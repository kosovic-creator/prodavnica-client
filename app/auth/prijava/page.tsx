import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import ClientLayout from '@/app/components/ClientLayout';
import PrijavaForm from './PrijavaForm';

import sr from '@/i18n/locales/sr/auth.json';
import en from '@/i18n/locales/en/auth.json';

interface PrijavaPageProps {
  searchParams: Promise<{ lang?: string; email?: string }>;
}
// dohvaća sarchParams iz URL-a (query ?lang=en ili ?lang=sr) i prosljeđuje ih komponenti PrijavaForm unutar ClientLayout-a
export default async function PrijavaPage({ searchParams }: PrijavaPageProps) {
  const params = await searchParams;
  //definiše jezik na osnovu query parametra, podrazumevano srpski
  const lang = params?.lang === 'en' ? 'en' : 'sr';
  // bira odgovarajući prevod na osnovu izabranog jezika
  const t = lang === 'en' ? en : sr;
  // dohvata email ako postoji u URL-u
  const initialEmail = params?.email || '';
  // proverava da li je korisnik ulogovan
  const session = await getServerSession(authOptions);
  // vfraća true ako je korisnik ulogovan, inače false
  const isLoggedIn = !!session?.user;
  // dohvaća ime korisnika ako je dostupno ako nije undefined
  const korisnikIme = typeof session?.user?.name === 'string' ? session.user.name : undefined;

  return (
    // koristi ClientLayout komponentu koja obavija PrijavaForm komponentu i prosleđuje potrebne propse
    <ClientLayout lang={lang} isLoggedIn={isLoggedIn} korisnikIme={korisnikIme}>
      <PrijavaForm lang={lang} prevod={t.login} initialEmail={initialEmail} />
    </ClientLayout>
  );
}

