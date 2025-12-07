"use client";
import { useEffect, useState } from "react";
import { getKorpa } from '@/lib/actions/korpa';
import { useSession } from 'next-auth/react';

export default function CartBadgeClient({ initialCount = 0 }: { initialCount?: number }) {
  const { data: session } = useSession();
  const [brojStavki, setBrojStavki] = useState(initialCount);

  useEffect(() => {
    async function fetchBrojStavki() {
      if (session?.user?.id) {
        const korpa = await getKorpa(session.user.id);
        if (korpa.success && korpa.data?.stavke) {
          setBrojStavki(korpa.data.stavke.reduce((sum, s) => sum + (s.kolicina || 1), 0));
        } else {
          setBrojStavki(0);
        }
      } else {
        setBrojStavki(0);
      }
    }
    const handler = () => { fetchBrojStavki(); };
    window.addEventListener('korpaChanged', handler);
    return () => window.removeEventListener('korpaChanged', handler);
  }, [session?.user?.id]);

  if (brojStavki <= 0) return null;
  return (
    <span className="ml-1 bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs font-bold">{brojStavki}</span>
  );
}
