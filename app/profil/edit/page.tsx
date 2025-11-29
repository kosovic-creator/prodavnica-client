'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaUser, FaSave, FaTimes } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { getKorisnikById, updateProfilKorisnika, updatePodaciPreuzimanja, createPodaciPreuzimanja } from '@/lib/actions';
import { korisnikSchema } from '@/zod';
import { useTranslation } from 'react-i18next';

interface Korisnik {
  id: string;
  ime: string;
  prezime: string;
  email: string;
  uloga: string;
  podaciPreuzimanja?: {
    id: string;
    adresa: string;
    drzava: string;
    grad: string;
    postanskiBroj: number;
    telefon: string;
  } | null;
}

export default function EditProfilPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t: tProfil } = useTranslation('profil');
  const { t: tKorisnici } = useTranslation('korisnici');
  const t = useCallback((key: string) => tKorisnici(key) !== key ? tKorisnici(key) : tProfil(key), [tKorisnici, tProfil]);

  const [, setKorisnik] = useState<Korisnik | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    ime: '',
    prezime: '',
    email: '',
    telefon: '',
    drzava: '',
    grad: '',
    postanskiBroj: '',
    adresa: '',
    uloga: 'korisnik',
    podaciId: '',
  });

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user?.id) {
      router.push('/auth/prijava');
      return;
    }

    const loadKorisnik = async () => {
      try {
        const result = await getKorisnikById(session.user.id);

        if (!result.success || !result.data) {
          toast.error('Greška pri učitavanju profila');
          router.push('/profil');
          return;
        }

        const userData = result.data;
        setKorisnik(userData);
        setForm({
          ime: userData.ime || '',
          prezime: userData.prezime || '',
          email: userData.email || '',
          telefon: userData.podaciPreuzimanja?.telefon || '',
          drzava: userData.podaciPreuzimanja?.drzava || '',
          grad: userData.podaciPreuzimanja?.grad || '',
          postanskiBroj: userData.podaciPreuzimanja?.postanskiBroj ? userData.podaciPreuzimanja.postanskiBroj.toString() : '',
          adresa: userData.podaciPreuzimanja?.adresa || '',
          uloga: userData.uloga || 'korisnik',
          podaciId: userData.podaciPreuzimanja?.id || '',
        });
      } catch (error) {
        console.error('Error loading user:', error);
        toast.error('Greška pri učitavanju profila');
        router.push('/profil');
      } finally {
        setLoading(false);
      }
    };

    loadKorisnik();
  }, [session, status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    setFormErrors({});

    const schema = korisnikSchema(t).omit({ lozinka: true, slika: true });
    const result = schema.safeParse(form);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach(err => {
        if (err.path[0]) errors[String(err.path[0])] = err.message;
      });
      setFormErrors(errors);
      return;
    }

    startTransition(async () => {
      try {
        const korisnikResult = await updateProfilKorisnika(session.user.id, {
          ime: form.ime,
          prezime: form.prezime,
          email: form.email,
          uloga: form.uloga,
        });

        if (!korisnikResult.success) {
          toast.error(korisnikResult.error || t('greska_pri_cuvanju'));
          return;
        }

        let podaciResult;
        if (form.podaciId) {
          podaciResult = await updatePodaciPreuzimanja(session.user.id, {
            adresa: form.adresa,
            drzava: form.drzava,
            grad: form.grad,
            postanskiBroj: Number(form.postanskiBroj),
            telefon: form.telefon,
          });
        } else {
          podaciResult = await createPodaciPreuzimanja(session.user.id, {
            adresa: form.adresa,
            drzava: form.drzava,
            grad: form.grad,
            postanskiBroj: Number(form.postanskiBroj),
            telefon: form.telefon,
          });
        }

        if (!podaciResult.success) {
          toast.error(podaciResult.error || t('greska_pri_cuvanju'));
          return;
        }

        toast.success(t('korisnik_izmjenjen'));
        router.push('/profil');
      } catch (error) {
        console.error('Error updating profile:', error);
        toast.error(t('greska_pri_cuvanju'));
      }
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster position="top-right" />
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2 text-center justify-center">
          <FaUser className="text-blue-600" />
          {t('title')} 
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  name="ime"
                  value={form.ime}
                  onChange={handleChange}
                  placeholder={t('name')}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base"
                  disabled={isPending}
                />
                {formErrors.ime && <div className="text-red-500 text-sm mt-1">{formErrors.ime}</div>}
              </div>
              <div>
                <input
                  name="prezime"
                  value={form.prezime}
                  onChange={handleChange}
                  placeholder={t('surname')}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base"
                  disabled={isPending}
                />
                {formErrors.prezime && <div className="text-red-500 text-sm mt-1">{formErrors.prezime}</div>}
              </div>
            </div>
            <div>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder={t('email')}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base"
                disabled={isPending}
              />
              {formErrors.email && <div className="text-red-500 text-sm mt-1">{formErrors.email}</div>}
            </div>
            <div>
              <input
                name="telefon"
                value={form.telefon}
                onChange={handleChange}
                placeholder={t('phone')}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base"
                disabled={isPending}
              />
              {formErrors.telefon && <div className="text-red-500 text-sm mt-1">{formErrors.telefon}</div>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  name="drzava"
                  value={form.drzava}
                  onChange={handleChange}
                  placeholder={t('country')}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base"
                  disabled={isPending}
                />
                {formErrors.drzava && <div className="text-red-500 text-sm mt-1">{formErrors.drzava}</div>}
              </div>
              <div>
                <input
                  name="grad"
                  value={form.grad}
                  onChange={handleChange}
                  placeholder={t('city')}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base"
                  disabled={isPending}
                />
                {formErrors.grad && <div className="text-red-500 text-sm mt-1">{formErrors.grad}</div>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  name="postanskiBroj"
                  value={form.postanskiBroj}
                  onChange={handleChange}
                  placeholder={t('postal_code')}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base"
                  disabled={isPending}
                />
                {formErrors.postanskiBroj && <div className="text-red-500 text-sm mt-1">{formErrors.postanskiBroj}</div>}
              </div>
              <div>
                <input
                  name="adresa"
                  value={form.adresa}
                  onChange={handleChange}
                  placeholder={t('address')}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base"
                  disabled={isPending}
                />
                {formErrors.adresa && <div className="text-red-500 text-sm mt-1">{formErrors.adresa}</div>}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isPending}
              >
                {isPending ? (
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <FaSave />
                )}
                {isPending ? 'Čuva se...' : t('sacuvaj_izmjene')}
              </button>
              <Link
                href="/profil"
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 transition-colors flex items-center justify-center gap-2 text-base font-medium"
              >
                <FaTimes />
                {t('odkazivanje')}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}