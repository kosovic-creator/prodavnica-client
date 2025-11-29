
import ProizvodiClient from './ProizvodiClient';
import { getProizvodi,deleteProizvod } from './../../lib/actions/proizvodi';

interface ProizvodiPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    lang?: string;
    search?: string;
  }>;
}


export default async function ProizvodiPage({ searchParams }: ProizvodiPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1');
  const pageSize = parseInt(resolvedSearchParams.pageSize || '10');
  const lang = resolvedSearchParams.lang || 'sr';
  const search = resolvedSearchParams.search || '';

  const result = await getProizvodi(page, pageSize, search);
  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-red-500 py-12">
            <p className="text-lg">Greška pri učitavanju proizvoda: {result.error}</p>
          </div>
        </div>
      </div>
    );
  }
  console.log('ProizvodiPage fetched data:', { pageSize, search });
  const { proizvodi, total } = result.data;

  return (
    <ProizvodiClient
      proizvodi={proizvodi}
      total={total}
      page={page}
      pageSize={pageSize}
      lang={lang}
      search={search}
    />
  );
}