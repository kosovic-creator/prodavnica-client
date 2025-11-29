'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { createPodaciPreuzimanja, updatePodaciPreuzimanja } from '@/lib/actions';

interface PodaciPreuzimanja {
  id: string;
  adresa: string;
  drzava: string;
  grad: string;
  postanskiBroj: number;
  telefon: string;
}

interface PodaciFormProps {
  userId: string;
  initialPodaci: PodaciPreuzimanja | null;
}

export default function PodaciForm({ userId, initialPodaci }: PodaciFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    adresa: initialPodaci?.adresa || '',
    drzava: initialPodaci?.drzava || '',
    grad: initialPodaci?.grad || '',
    postanskiBroj: initialPodaci?.postanskiBroj?.toString() || '',
    telefon: initialPodaci?.telefon || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const podaciData = {
          adresa: form.adresa,
          drzava: form.drzava,
          grad: form.grad,
          postanskiBroj: Number(form.postanskiBroj),
          telefon: form.telefon,
        };

        let result;
        if (initialPodaci) {
          // Update existing data
          result = await updatePodaciPreuzimanja(userId, podaciData);
        } else {
          // Create new data
          result = await createPodaciPreuzimanja(userId, podaciData);
        }

        if (!result.success) {
          toast.error(result.error || 'Greška pri unosu.');
          return;
        }

        toast.success('Podaci su uspešno sačuvani!');
        router.push('/');
      } catch (error) {
        console.error('Error saving delivery data:', error);
        toast.error('Greška pri unosu.');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {initialPodaci ? 'Ažuriraj podatke za preuzimanje' : 'Podaci za preuzimanje'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              name="adresa"
              value={form.adresa}
              onChange={handleChange}
              placeholder="Adresa"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
              disabled={isPending}
            />
          </div>

          <div>
            <input
              name="drzava"
              value={form.drzava}
              onChange={handleChange}
              placeholder="Država"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
              disabled={isPending}
            />
          </div>

          <div>
            <input
              name="grad"
              value={form.grad}
              onChange={handleChange}
              placeholder="Grad"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
              disabled={isPending}
            />
          </div>

          <div>
            <input
              name="postanskiBroj"
              value={form.postanskiBroj}
              onChange={handleChange}
              placeholder="Poštanski broj"
              type="number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
              disabled={isPending}
            />
          </div>

          <div>
            <input
              name="telefon"
              value={form.telefon}
              onChange={handleChange}
              placeholder="Telefon"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
              disabled={isPending}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                Čuva se...
              </>
            ) : (
              initialPodaci ? 'Ažuriraj podatke' : 'Sačuvaj podatke'
            )}
          </button>
        </form>

        {initialPodaci && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 text-center">
              ℹ️ Ažuriranje postojećih podataka za preuzimanje
            </p>
          </div>
        )}
      </div>
    </div>
  );
}