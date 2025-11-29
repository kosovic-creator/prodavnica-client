import { getServerSession } from 'next-auth';
import { getKorisnikById } from '@/lib/actions';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/authOptions';

import ProfilClient from './ProfilClient';
import type { Korisnik } from '@/types'; // Adjust the import path if needed

export default async function ProfilPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/prijava');
  }

  const result = await getKorisnikById(session.user.id);

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">Greška pri učitavanju profila</div>
          <p className="text-gray-600">{result.error}</p>
        </div>
      </div>
    );
  }

  // Ensure korisnik has all required fields for the Korisnik type
  const korisnik: Korisnik = {
    ...result.data,
    telefon: result.data.podaciPreuzimanja?.telefon ?? '',
    grad: result.data.podaciPreuzimanja?.grad ?? '',
    postanskiBroj: Number(result.data.podaciPreuzimanja?.postanskiBroj) || 0,
    adresa: result.data.podaciPreuzimanja?.adresa ?? '',
  };

  return <ProfilClient korisnik={korisnik} userId={session.user.id} />;
}