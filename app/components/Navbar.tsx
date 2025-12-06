/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useSession, signOut } from "next-auth/react";
import React, { useEffect, useState, Suspense } from "react";

import { FaShoppingCart, FaHome, FaUser, FaSignInAlt, FaSignOutAlt, FaUserShield, FaChevronDown, FaSearch, FaTimes, FaBars, FaUsers, FaBox, FaHistory, FaHeart } from "react-icons/fa";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

import Link from "next/link";

interface NavbarProps {
  setSidebarOpen?: (open: boolean) => void;
}

// Komponenta koja koristi useSearchParams - mora biti u Suspense
function NavbarContent({ setSidebarOpen }: NavbarProps) {
  const [currentLanguage, setCurrentLanguage] = useState('sr');
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Uzimanje jezika iz URL-a
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlLang = new URL(window.location.href).searchParams.get('lang');
      if (urlLang && urlLang !== currentLanguage) {
        setCurrentLanguage(urlLang);
      }
    }
  }, [searchParams]);

  const changeLanguage = (lang: string) => {
    setCurrentLanguage(lang);
    setLanguageDropdownOpen(false);
    try {
      const urlSearchParams = new URLSearchParams(window.location.search);
      urlSearchParams.set('lang', lang);
      router.push(`${pathname}?${urlSearchParams.toString()}`);
    } catch (error) {
      router.push(`${pathname}?lang=${lang}`);
    }
  };

  const navigateWithLang = (path: string) => {
    try {
      router.push(`${path}?lang=${currentLanguage}`);
    } catch (error) {
      router.push(`${path}?lang=sr`);
    }
  };

  const getLanguageFlag = (lang: string) => {
    return lang === 'en' ? '🇬🇧' : '🇲🇪';
  };

  const getLanguageName = (lang: string) => {
    return lang === 'en' ? 'English' : 'Crnogorski';
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-white shadow-sm">
      {/* Hamburger ikona */}
      <button
        className="p-2 sm:p-3 focus:outline-none rounded-lg hover:bg-gray-100 touch-manipulation"
        onClick={() => setSidebarOpen && setSidebarOpen(true)}
        aria-label="Otvori meni"
      >
        <FaBars className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
      </button>
      <div className="flex items-center gap-2">
        {/* Prijava/Odjava */}
        {!session?.user ? (
          <button
            onClick={() => navigateWithLang('/auth/prijava')}
            className="flex items-center justify-center p-2 sm:p-3 rounded-lg hover:bg-blue-50 transition touch-manipulation min-w-11 min-h-11"
          >
            <FaSignInAlt className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        ) : (
          <button
            onClick={() => signOut({ callbackUrl: "/auth/prijava" })}
            className="flex items-center justify-center p-2 sm:p-3 rounded-lg hover:bg-blue-50 transition touch-manipulation min-w-11 min-h-11"
          >
            <FaSignOutAlt className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
        {/* Izbor jezika */}
        <div className="relative language-dropdown ml-2">
          <button
            onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
            className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none touch-manipulation min-w-11 min-h-11"
          >
            <span className="text-lg sm:text-xl">{getLanguageFlag(currentLanguage)}</span>
            <span className="hidden md:inline text-xs sm:text-sm font-medium">{getLanguageName(currentLanguage)}</span>
            <FaChevronDown className={`text-gray-500 text-xs transition-transform ${languageDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {languageDropdownOpen && (
            <div className="absolute right-0 mt-2 w-36 sm:w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <button
                onClick={() => changeLanguage('sr')}
                className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-gray-50 transition-colors touch-manipulation ${currentLanguage === 'sr' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
              >
                <span className="text-lg sm:text-xl">🇲🇪</span>
                <span className="text-xs sm:text-sm">Crnogorski</span>
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-gray-50 transition-colors touch-manipulation ${currentLanguage === 'en' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
              >
                <span className="text-lg sm:text-xl">🇬🇧</span>
                <span className="text-xs sm:text-sm">English</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// Glavna Navbar komponenta sa Suspense
export default function Navbar({ setSidebarOpen }: NavbarProps) {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <NavbarContent setSidebarOpen={setSidebarOpen} />
    </Suspense>
  );
}


