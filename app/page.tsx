import BannerPage from './@banner/page';
import GridPage from './@grid/page';

export default async function HomePage({ searchParams }: { searchParams?: Promise<{ lang?: string }> }) {
  const params = searchParams ? await searchParams : {};
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

