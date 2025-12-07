"use client";
import { useState } from "react";
import Link from "next/link";

interface Props {
  lang: string;
  t: Record<string, string>;
}

export default function ProfileDropdownClient({ lang, t }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span>👤</span>
        <span className="hidden sm:inline">{t.profile}</span>
        <span className="ml-1">▼</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <Link href={`/profil?lang=${lang}`} className="block px-4 py-3 hover:bg-gray-50 text-gray-700">{t.profile}</Link>
          <Link href={`/moje-porudzbine?lang=${lang}`} className="block px-4 py-3 hover:bg-gray-50 text-gray-700">{t.my_orders}</Link>
          <Link href={`/omiljeni?lang=${lang}`} className="block px-4 py-3 hover:bg-gray-50 text-gray-700">{t.favorites}</Link>
          <hr className="my-1 border-gray-200" />
          <Link href={`/auth/odjava?lang=${lang}`} className="block px-4 py-3 hover:bg-gray-50 text-gray-700">{t.logout}</Link>
        </div>
      )}
    </div>
  );
}
