import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getProizvodi } from '@/lib/actions';
import ProizvodiGridHomeClient from './ProizvodiGridHomeClient';

export default async function GridPage() {
  const session = await getServerSession(authOptions);

  // Get products on server-side
  const result = await getProizvodi(1, 12);
  const proizvodi = result.success ? result.data?.proizvodi || [] : [];

  return <ProizvodiGridHomeClient initialProizvodi={proizvodi} session={session} />;
}
