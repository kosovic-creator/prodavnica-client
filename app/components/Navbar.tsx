import sr from '@/i18n/locales/sr/navbar.json';
import en from '@/i18n/locales/en/navbar.json';

interface NavbarProps {
  lang?: string;
  isAdmin?: boolean;
  brojUKorpi?: number;
  setSidebarOpen?: (open: boolean) => void;
}

export default function Navbar({ lang = 'sr', isAdmin = false, brojUKorpi = 0, setSidebarOpen }: NavbarProps) {
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
              <span className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700">☰</span>
            </button>
            <a
              href={`/?lang=${lang}`}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg hover:bg-red-50 transition touch-manipulation min-w-0"
            >
              <span className="text-xl sm:text-2xl">🛒</span>
              <span className="font-bold text-blue-700 text-sm sm:text-base truncate">
                <span className="hidden xs:inline">{t.title}</span>
                <span className="xs:hidden">Trgovina</span>
              </span>
            </a>
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
            <a href={`/?lang=${lang}`} className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition">
              <span>🏠</span>
              <span>{t.home}</span>
            </a>
            <a href={`/profil?lang=${lang}`} className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition">
              <span>👤</span>
              <span>{t.profile}</span>
            </a>
            <a href={`/omiljeni?lang=${lang}`} className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition">
              <span>❤️</span>
              <span>{t.favorites}</span>
            </a>
            <a href={`/moje-porudzbine?lang=${lang}`} className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition">
              <span>📦</span>
              <span>{t.my_orders}</span>
            </a>
            <a href={`/korpa?lang=${lang}`} className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition relative">
              <span>🛒</span>
              <span>{t.cart}</span>
              {brojUKorpi > 0 && (
                <span className="ml-1 bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs font-bold">{brojUKorpi}</span>
              )}
            </a>
          </div>
        </>
      )}
    </nav>
  );
}


