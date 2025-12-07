"use client";
import React, { useState } from "react";
import { useCart } from "./CartContext";
import { useSession } from "next-auth/react";
import sr from '@/i18n/locales/sr/navbar.json';
import en from '@/i18n/locales/en/navbar.json';
import Link from 'next/link';
import { FaShoppingCart, FaHome, FaSignInAlt, FaSignOutAlt, FaBars } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";

interface NavbarProps {
  lang?: string;
  isAdmin?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ lang, isAdmin, setSidebarOpen }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLang = searchParams.get('lang') || lang || 'sr';
  const t = currentLang === 'en' ? en : sr;
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const { brojUKorpi } = useCart();
  const badgeCount = brojUKorpi;
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLangSwitch = () => {
    const newLang = currentLang === 'sr' ? 'en' : 'sr';
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('lang', newLang);
    router.replace(`?${params.toString()}`);
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 border-b border-gray-200 bg-white shadow-sm">
      {!isAdmin && (
        <>
          {/* Left Section - Hamburger + Logo */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              className="p-2 sm:p-3 focus:outline-none rounded-lg hover:bg-gray-100 touch-manipulation"
              onClick={() => setSidebarOpen?.(true)}
              aria-label="Open sidebar"
            >
              <FaBars className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
            </button>
            <Link
              href={`/?lang=${currentLang}`}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg hover:bg-red-50 transition touch-manipulation min-w-0"
            >
              <FaHome className="text-xl sm:text-2xl text-blue-700" />
              <span className="font-bold text-blue-700 text-sm sm:text-base truncate">
                <span className="hidden xs:inline">{t.title}</span>
                <span className="xs:hidden">Trgovina</span>
              </span>
            </Link>
          </div>
          {/* Center Section - Desktop Search */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <form action="/proizvodi" method="get" className="flex items-center gap-2 w-full">
              <input
                type="text"
                name="search"
                className="flex-1 border rounded px-3 py-2"
                placeholder={t.search}
              />
              <input type="hidden" name="lang" value={currentLang} />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">{t.search}</button>
            </form>
          </div>
          {/* Right Section - Profile, Cart, Language Switcher */}
          <div className="flex items-center gap-3">
            {/* Profile dropdown for logged-in user */}
            {isLoggedIn ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(v => !v)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                    aria-haspopup="true"
                    aria-expanded={dropdownOpen}
                  >
                    <span>👤</span>
                    <span className="hidden sm:inline">{t.profile}</span>
                    <span className="ml-1">▼</span>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <Link href={`/profil?lang=${currentLang}`} className="block px-4 py-3 hover:bg-gray-50 text-gray-700">{t.profile}</Link>
                      <Link href={`/moje-porudzbine?lang=${currentLang}`} className="block px-4 py-3 hover:bg-gray-50 text-gray-700">{t.my_orders}</Link>
                      <Link href={`/omiljeni?lang=${currentLang}`} className="block px-4 py-3 hover:bg-gray-50 text-gray-700">{t.favorites}</Link>
                      <hr className="my-1 border-gray-200" />
                      <button
                        onClick={() => signOut({ callbackUrl: `/?lang=${currentLang}` })}
                        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
                      >
                        <FaSignOutAlt />
                        <span>{t.logout}</span>
                      </button>
                    </div>
                  )}
                </div>
                {/* Odjava ikona direktno u navbaru */}
                <button
                  onClick={() => signOut({ callbackUrl: `/?lang=${currentLang}` })}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                  title={t.logout}
                >
                  <FaSignOutAlt />
                  <span className="hidden sm:inline">{t.logout}</span>
                </button>
              </>
            ) : (
              <Link href={`/auth/prijava?lang=${currentLang}`} className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition">
                <FaSignInAlt />
                <span>{t.login || 'Prijava'}</span>
              </Link>
            )}
            {/* Cart badge */}
            <Link href={`/korpa?lang=${currentLang}`} className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition relative">
              <span className="relative">
                <FaShoppingCart />
                {badgeCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs font-bold border border-white shadow">
                    {badgeCount}
                  </span>
                )}
              </span>
              <span>{t.cart}</span>
            </Link>
            {/* Login link for guests */}
            {!isLoggedIn && (
              <Link href={`/auth/prijava?lang=${currentLang}`} className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition">
                <FaSignInAlt />
                <span>{t.login || 'Prijava'}</span>
              </Link>
            )}
            {/* Language Switcher inline */}
            <button
              onClick={handleLangSwitch}
              className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium"
            >
              {currentLang === 'sr' ? 'EN' : 'SR'}
            </button>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
