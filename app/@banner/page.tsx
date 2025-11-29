import { getProizvodi } from '@/lib/actions';
import ProizvodiBannerClient from './ProizvodiBannerClient';

export default async function BannerPage() {
  // Get products on server-side
  const result = await getProizvodi(1, 12);
  const proizvodi = result.success ? result.data?.proizvodi || [] : [];

  return <ProizvodiBannerClient initialProizvodi={proizvodi} />;
}