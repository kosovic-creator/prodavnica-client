

import { getProizvodi } from '@/lib/actions';
import BannerRotatorClient from './BannerRotatorClient';

function getCurrentLang() {
  // Server-side: fallback to sr, može se proširiti za detekciju jezika
  return 'sr';
}

export default async function BannerPage({ lang = 'sr' }: { lang?: string }) {
  const result = await getProizvodi(1, 12);
  const proizvodiRaw = result.success ? result.data?.proizvodi || [] : [];
  // Filter proizvode sa slikama
  const proizvodi = proizvodiRaw.filter((p) => Array.isArray(p.slike) && p.slike.length > 0);
  const proizvodiBanner = proizvodi.length > 0 ? proizvodi : proizvodiRaw;
  return <BannerRotatorClient proizvodi={proizvodiBanner} lang={lang} />;
}