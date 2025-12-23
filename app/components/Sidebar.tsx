'use client';

import * as React from 'react';
import { Suspense } from 'react';
import srSidebarJson from '@/i18n/locales/sr/sidebar.json';
import enSidebarJson from '@/i18n/locales/en/sidebar.json';

const srSidebar: Record<string, string> = srSidebarJson;
const enSidebar: Record<string, string> = enSidebarJson;
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FaBoxOpen, FaUser, FaTimes, FaShoppingBag, FaChartBar, FaCog, FaPhone, FaInfoCircle } from 'react-icons/fa';
import { useSession } from 'next-auth/react';


interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface SidebarContentProps extends SidebarProps {
  lang?: string;
}

function SidebarContent({ open, onClose, lang = 'sr' }: SidebarContentProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();
  const t = (key: string) => (lang === 'en' ? enSidebar[key] : srSidebar[key]) || key;



  // Funkcija za navigaciju koja zadržava trenutni jezik
  const navigateWithLang = (path: string) => {
    const currentLang = searchParams?.get('lang') || 'sr';
    router.push(`${path}?lang=${currentLang}`);
    onClose();
  };

  const isActive = (path: string) => {
    return pathname === path;
  };


  // User menu items
  const userMenuItems = React.useMemo(() => [
    { path: '/proizvodi', icon: FaBoxOpen, label: t('proizvodi') },
    ...(session?.user ? [
      // { path: '/moje-porudzbine', icon: FaHistory, label: t('moje_narudzbine') },
      // { path: '/korpa', icon: FaShoppingCart, label: t('korpa') },
      // { path: '/omiljeni', icon: FaHeart, label: t('omiljeni') },
      //  { path: '/profil', icon: FaUser, label: t('profile') },
    ] : []),
    // { path: '/o-nama', icon: FaInfoCircle, label: t('o_nama') },
    // { path: '/kontakt', icon: FaPhone, label: t('kontakt') },
  ], [t, session?.user]);

  const menuItems =  userMenuItems;

  return (
    <>
      {/* Sidebar - modifikujemo za mobilnu verziju */}
      <span className="text-xs text-gray-400 absolute left-2 top-0">lang: {lang}</span>
      <div className={`
        fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white shadow-lg z-50 transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        w-64 flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛒</span>
            <h2 className="font-bold text-blue-700 text-lg">
              {/* {isAdmin ? t('admin_panel') : t('meni')} */}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={t('close_sidebar')}
          >
            <FaTimes className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* User Info */}
        {session?.user && (
          <div className="p-4 border-b border-gray-100 bg-linear-to-r from-blue-50 to-purple-50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                {session.user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-800 truncate text-sm">
                  {session.user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session.user.email}
                </p>

              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu - flex-1 za proširenje */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon; // Dobij ikonu komponentu

              return (
                <li key={item.path}>
                  <button
                    onClick={() => navigateWithLang(item.path)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                      ${active
                        ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-600 '
                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600 cursor-pointer'
                      }
                    `}
                  >
                    {item.path === '/proizvodi' ? (
                      <span className={`flex items-center justify-center ${active ? 'bg-blue-600 text-white ' : 'bg-gray-100 text-blue-600'} rounded-full w-8 h-8`}>
                        <Icon className={`w-5 h-5`} />
                      </span>
                    ) : (
                        <Icon className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                    )}
                    <span className="font-medium text-sm truncate">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer - flex-shrink-0 da ostane na dnu */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 shrink-0">
          <div className="text-center">
            <p className="text-xs text-gray-500">{t('web_trgovina')}</p>
            <p className="text-xs text-gray-400">v1.0.0</p>
          </div>
        </div>
      </div>

      {/* Opciono: Dodajemo invisible overlay samo za zatvaranje klikom van sidebar-a */}
      {open && (
        <div
          className="fixed top-16 left-64 right-0 bottom-0 z-30 md:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}

// Glavna Sidebar komponenta sa Suspense
interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

// Sidebar sada prima lang prop
export default function Sidebar({ open, onClose, lang = 'sr' }: SidebarProps & { lang?: string }) {
  return <SidebarContent open={open} onClose={onClose} lang={lang} />;
}
