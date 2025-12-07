/* eslint-disable @typescript-eslint/no-explicit-any */
import BannerPage from './@banner/page';
import GridPage from './@grid/page';

export default async function HomePage({ searchParams }: { searchParams?: { lang?: string } | Promise<{ lang?: string }> }) {
  let params: { lang?: string } | undefined;
  if (searchParams && typeof (searchParams as Promise<any>).then === 'function') {
    params = await (searchParams as Promise<{ lang?: string }>);
  } else {
    params = searchParams as { lang?: string };
  }
  const lang = params?.lang === 'en' ? 'en' : 'sr';
  return (
    <main className="flex flex-col gap-8">
      {/* Banner gore */}
      <BannerPage lang={lang} />
      {/* Grid proizvoda dolje */}
      <GridPage lang={lang} />
    </main>
  );
}

