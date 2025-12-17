"use client";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LanguageSwitcherClient() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Helper to build new search string with replaced lang
  function buildSearch(newLang: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", newLang);
    return `${pathname}?${params.toString()}`;
  }

  const currentLang = searchParams.get("lang") === "en" ? "en" : "sr";

  return (
    <>
      <Link
        href={buildSearch("en")}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg transition cursor-pointer
          ${currentLang === 'en'
            ? 'bg-blue-600 text-white shadow font-bold'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}
        `}
        title="Switch to English"
        prefetch={false}
      >
        <span>🇬🇧</span>
        <span>English</span>
      </Link>
      <Link
        href={buildSearch("sr")}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg transition cursor-pointer
          ${currentLang === 'sr'
            ? 'bg-blue-600 text-white shadow font-bold'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}
        `}
        title="Switch to Montenegron"
        prefetch={false}
      >
        <span>🇲🇪</span>
        <span>Crnogorski</span>
      </Link>
    </>
  );
}
