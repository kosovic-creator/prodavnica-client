/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useSession, signOut } from "next-auth/react";
import React, { useEffect, useState, Suspense } from "react";
import { FaShoppingCart, FaHome, FaUser, FaSignInAlt, FaSignOutAlt, FaUserShield, FaChevronDown, FaSearch, FaTimes, FaBars, FaUsers, FaBox, FaHistory, FaHeart } from "react-icons/fa";
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n/config';
import { useKorpa } from "./KorpaContext";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useSearch } from './SearchContext';
import Link from "next/link";

interface NavbarProps {
  setSidebarOpen?: (open: boolean) => void;
}

// Komponenta koja koristi useSearchParams - mora biti u Suspense
function NavbarContent({ setSidebarOpen }: NavbarProps) {
  const [currentLanguage, setCurrentLanguage] = useState('sr');
  const [brojUKorpi, setBrojUKorpi] = useState(0);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { t } = useTranslation('navbar');
  const { data: session } = useSession();
  const { brojStavki, setBrojStavki } = useKorpa();
  const isAdmin = session?.user && 'uloga' in session.user ? session.user.uloga === 'admin' : false;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams(); // Sada je u Suspense boundary
  const { setSearchTerm } = useSearch();
  // Automatski učitaj jezik iz URL-a pri mountu
  useEffect(() => {
    if (typeof window !== 'undefined') {
      //učita lang bez reloadovanja stranice
      const urlLang = new URL(window.location.href).searchParams.get('lang');
      if (urlLang && urlLang !== i18n.language) {
        i18n.changeLanguage(urlLang);
        setTimeout(() => setCurrentLanguage(urlLang), 0);
      }
    }
  }, []);

  // Handle client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setTimeout(() => setIsMounted(true), 0);
  }, []);

  // Safely get current language
  useEffect(() => {
    if (isMounted) {
      try {
        const langFromUrl = searchParams?.get('lang') || i18n.language || 'sr';
        setTimeout(() => setCurrentLanguage(langFromUrl), 0);
      } catch (error) {
        setTimeout(() => setCurrentLanguage('sr'), 0);
      }
    }
  }, [searchParams, isMounted]);

  useEffect(() => {
    const broj = Number(localStorage.getItem('brojUKorpi') || 0);
    setTimeout(() => {
      setBrojUKorpi(broj);
      setBrojStavki(broj);
    }, 0);

    const handler = () => {
      const broj = Number(localStorage.getItem('brojUKorpi') || 0);
      setTimeout(() => {
        setBrojUKorpi(broj);
        setBrojStavki(broj);
      }, 0);
    };

    window.addEventListener('korpaChanged', handler);
    return () => window.removeEventListener('korpaChanged', handler);
  }, [setBrojStavki]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (languageDropdownOpen && !target.closest('.language-dropdown')) {
        setLanguageDropdownOpen(false);
      }
      if (userDropdownOpen && !target.closest('.user-dropdown')) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [languageDropdownOpen, userDropdownOpen]);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      router.push(`/proizvodi?search=${encodeURIComponent(localSearch.trim())}&lang=${currentLanguage}`);
      setShowMobileSearch(false);
    }
  };

  const getLanguageFlag = (lang: string) => {
    return lang === 'en' ? '🇬🇧' : '🇲🇪';
  };

  const getLanguageName = (lang: string) => {
    return lang === 'en' ? 'English' : 'Crnogorski';
  };

  return (
    <>
      {/* Main Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 border-b border-gray-200 bg-white shadow-sm">
        {!isAdmin && (
          <>
            {/* Left Section - Hamburger + Logo */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Hamburger - larger touch target */}
              <button
                className="p-2 sm:p-3 focus:outline-none rounded-lg hover:bg-gray-100 touch-manipulation"
                onClick={() => setSidebarOpen?.(true)}
                aria-label="Open sidebar"
              >
                <FaBars className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </button>

              {/* App Logo - responsive */}
              <button
                onClick={() => navigateWithLang('/')}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg hover:bg-red-50 transition touch-manipulation min-w-0"
              >
                <span className="text-xl sm:text-2xl">🛒</span>
                <span className="font-bold text-blue-700 text-sm sm:text-base truncate">
                  <span className="hidden xs:inline">
                    {isMounted ? t('title') : (currentLanguage === 'en' ? 'WebShop' : 'WebTrgovina')}
                  </span>
                  <span className="xs:hidden">Trgovina</span>
                </span>
              </button>
            </div>

            {/* Center Section - Desktop Search */}
            <div className="hidden lg:flex flex-1 max-w-md mx-4">
              <form onSubmit={handleSearch} className="flex items-center gap-2 w-full">
                <div className="flex items-center w-full gap-2">
                  <input
                    type="text"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    placeholder={isMounted ? t('search') + '...' : (currentLanguage === 'en' ? 'Search...' : 'Pretraga...')}
                    className="border border-blue-300 rounded-lg p-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full text-base"
                  />
                  {localSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setLocalSearch('');
                        // Resetuje search parametar u URL-u
                        const params = new URLSearchParams(window.location.search);
                        params.delete('search');
                        // Očuvaj lang parametar ako postoji
                        const lang = params.get('lang') || currentLanguage;
                        router.push(`/proizvodi?lang=${lang}`);
                      }}
                      className="text-gray-400 hover:text-red-600 w-8 h-8 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center text-lg font-bold shrink-0"
                      title="Obriši pretragu"
                    >
                      ×
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition touch-manipulation"
                >
                  <FaSearch />
                </button>
              </form>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="lg:hidden p-2 sm:p-3 focus:outline-none rounded-lg hover:bg-blue-50 transition touch-manipulation"
              >
                <FaSearch className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Korpa */}
              {session?.user && (
                <button
                  onClick={() => navigateWithLang('/korpa')}
                  className="relative flex items-center justify-center p-2 sm:p-3 rounded-lg hover:bg-blue-50 transition touch-manipulation min-w-11 min-h-11"
                >
                  <FaShoppingCart className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5" />
                  {brojUKorpi > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full px-1.5 py-0.5 text-xs min-w-[18px] text-center leading-none">
                      {brojUKorpi > 99 ? '99+' : brojUKorpi}
                    </span>
                  )}
                </button>
              )}


              {/* Login/Logout */}
              {!session?.user ? (
                <button
                  onClick={() => navigateWithLang('/auth/prijava')}
                  className="flex items-center justify-center p-2 sm:p-3 rounded-lg hover:bg-blue-50 transition touch-manipulation min-w-11 min-h-11"
                >
                  <FaSignInAlt className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              ) : (
                <>
                    {/* User Profile Dropdown */}
                    <div className="relative user-dropdown">
                      <button
                        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                        className="flex items-center justify-center p-2 sm:p-3 rounded-lg hover:bg-blue-50 transition touch-manipulation min-w-11 min-h-11"
                      >
                        <FaUser className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5" />
                      </button>

                      {userDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                          <button
                            onClick={() => {
                              navigateWithLang('/profil');
                              setUserDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors touch-manipulation text-gray-700"
                          >
                            <FaUser className="text-blue-600" />
                            <span className="text-sm">
                              {isMounted ? t('profile') : (currentLanguage === 'en' ? 'Profile' : 'Profil')}
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              navigateWithLang('/moje-porudzbine');
                              setUserDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors touch-manipulation text-gray-700"
                          >
                            <FaHistory className="text-blue-600" />
                            <span className="text-sm">
                              {isMounted ? t('my_orders') : (currentLanguage === 'en' ? 'My Orders' : 'Moje porudžbine')}
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              navigateWithLang('/omiljeni');
                              setUserDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors touch-manipulation text-gray-700"
                          >
                            <FaHeart className="text-blue-600" />
                            <span className="text-sm">
                              {isMounted ? t('favorites') : (currentLanguage === 'en' ? 'Favorites' : 'Omiljeni')}
                            </span>
                          </button>
                          <hr className="my-1 border-gray-200" />
                          <button
                            onClick={() => {
                              signOut({ callbackUrl: "/auth/prijava" });
                              setUserDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors touch-manipulation text-gray-700"
                          >
                            <FaSignOutAlt className="text-blue-600" />
                            <span className="text-sm">
                              {isMounted ? t('logout') : (currentLanguage === 'en' ? 'Logout' : 'Odjava')}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
              )}

              {/* Language Dropdown - Hide in admin section */}
              {!pathname?.startsWith('/admin') && (
                <div className="relative language-dropdown">
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
                        className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-gray-50 transition-colors touch-manipulation ${currentLanguage === 'sr' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                      >
                        <span className="text-lg sm:text-xl">🇲🇪</span>
                        <span className="text-xs sm:text-sm">Crnogorski</span>
                      </button>
                      <button
                        onClick={() => changeLanguage('en')}
                        className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-gray-50 transition-colors touch-manipulation ${currentLanguage === 'en' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                      >
                        <span className="text-lg sm:text-xl">🇬🇧</span>
                        <span className="text-xs sm:text-sm">English</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Admin Section */}
        {isAdmin && (
          <div className="flex items-center gap-2 ml-auto">
            <Link
              href="/admin/korisnici"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition touch-manipulation"
            >
              <FaUsers className="text-blue-600" />
              <span className="hidden sm:inline">
                Korisnici
              </span>
            </Link>
            <Link
              href="/admin/proizvodi"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition touch-manipulation"
            >
              <FaBox className="text-blue-600" />
              Artikli
            </Link>
            <Link
              href="/admin/porudzbine"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition touch-manipulation"
            >
              <FaShoppingCart className="text-blue-600" />
              Porudžbine
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/prijava" })}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition touch-manipulation"
            >
              <FaSignOutAlt className="text-blue-600" />
              <span className="hidden sm:inline">
                {isMounted ? t('logout') : (currentLanguage === 'en' ? 'Logout' : 'Odjava')}
              </span>
            </button>
          </div>
        )}
      </nav>

      {/* Mobile Search Bar */}
      {showMobileSearch && !isAdmin && (
        <div className="lg:hidden bg-white border-b border-gray-200 p-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="flex items-center flex-1 gap-2">
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Pretraži proizvode..."
                className="border border-blue-300 rounded-lg p-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full text-base"
                autoFocus
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearch('');
                    setSearchTerm('');
                  }}
                  className="text-gray-400 hover:text-red-600 w-8 h-8 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center text-lg font-bold shrink-0"
                  title="Obriši pretragu"
                >
                  ×
                </button>
              )}
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition touch-manipulation"
            >
              <FaSearch />
            </button>
          </form>
        </div>
      )}
    </>
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


