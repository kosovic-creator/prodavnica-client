/* eslint-disable @typescript-eslint/no-explicit-any */

import BannerPage from './@banner/page';
import GridPage from './@grid/page';
import ClientLayout from './components/ClientLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getKorpa } from '@/lib/actions/korpa';


export default async function HomePage({ searchParams }: { searchParams?: { lang?: string } | Promise<{ lang?: string }> }) {
  let params: { lang?: string } | undefined;
  if (searchParams && typeof (searchParams as Promise<any>).then === 'function') {
    params = await (searchParams as Promise<{ lang?: string }>);
  } else {
    params = searchParams as { lang?: string };
  }
  const lang = params?.lang === 'en' ? 'en' : 'sr';
  const session = await getServerSession(authOptions);
  let brojUKorpi = 0;
  if (session?.user?.id) {
    const korpa = await getKorpa(session.user.id);
    if (korpa.success && korpa.data?.stavke) {
      brojUKorpi = korpa.data.stavke.reduce((sum, s) => sum + (s.kolicina || 1), 0);
    }
  }
  return (
    <ClientLayout lang={lang}>
      <main className="flex flex-col gap-8">
        {/* Banner gore */}
        <BannerPage lang={lang} />
        {/* Grid proizvoda dolje */}
        <GridPage lang={lang} />
      </main>
    </ClientLayout>
  );
}

