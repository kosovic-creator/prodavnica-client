import sr from '@/i18n/locales/sr/navbar.json';
import en from '@/i18n/locales/en/navbar.json';
import Link from 'next/link';
import { FaShoppingCart, FaHome, FaUser, FaSignInAlt, FaSignOutAlt, FaBars } from "react-icons/fa";
import CartBadgeClient from '../components/CartBadgeClient';

interface NavbarProps {
  lang?: string;
  isAdmin?: boolean;
  brojUKorpi?: number;
  setSidebarOpen?: (open: boolean) => void;
  isLoggedIn?: boolean;
  korisnikIme?: string;
}

export default function Navbar({ lang = 'sr', isAdmin = false, brojUKorpi = 0, setSidebarOpen, isLoggedIn = false, korisnikIme }: NavbarProps) {
  const t = lang === 'en' ? en : sr;

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
            <a
              href={`/?lang=${lang}`}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg hover:bg-red-50 transition touch-manipulation min-w-0"
            >
              <FaHome className="text-xl sm:text-2xl text-blue-700" />
              <span className="font-bold text-blue-700 text-sm sm:text-base truncate">
                <span className="hidden xs:inline">{t.title}</span>
                <span className="xs:hidden">Trgovina</span>
              </span>
            </a>
            {korisnikIme && (
              <span className="font-semibold text-blue-700 ml-2 truncate max-w-[120px] hidden sm:block" title={korisnikIme}>
                {korisnikIme.trim() || 'Korisnik'}
              </span>
            )}
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
              <input type="hidden" name="lang" value={lang} />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">{t.search}</button>
            </form>
          </div>
          {/* Right Section - Links */}
          <div className="flex items-center gap-3">

            {/* Profil dugme */}
            <a href={`/profil?lang=${lang}`} className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition">
              <FaUser />
              <span>{t.profile || 'Profil'}</span>
            </a>
            <a href={`/korpa?lang=${lang}`} className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition relative">
              <FaShoppingCart />
              <span>{t.cart}</span>
              <CartBadgeClient initialCount={brojUKorpi} />
            </a>
            {!isLoggedIn && (
              <a href={`/auth/prijava?lang=${lang}`} className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition">
                <FaSignInAlt />
                <span>{t.login || 'Prijava'}</span>
              </a>
            )}

            {isLoggedIn && (
              <a href={`/auth/odjava?lang=${lang}`} className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition">
                <FaSignOutAlt className="text-blue-600" />
                <span>{t.logout || 'Odjava'}</span>
              </a>
            )}

            {/* Language Switcher Toggle - SSR link */}
            {/* Language Switcher Toggle - SSR link */}
            <Link
              href="/?lang=en"
              className={`flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition cursor-pointer${lang === 'en' ? ' font-bold underline' : ''}`}
              title="Switch to English"
              prefetch={false}
            >
              <span>🇬🇧</span>
              <span>English</span>
            </Link>
            <Link
              href="/?lang=sr"
              className={`flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition cursor-pointer${lang === 'en' ? ' font-bold underline' : ''}`}
              title="Switch to Montenegron"
              prefetch={false}
            >
              <span>🇲🇪</span>
              <span>Crnogorski</span>
            </Link>

          </div>
        </>
      )}
    </nav>
  );
}


