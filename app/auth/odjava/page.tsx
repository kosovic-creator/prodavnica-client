/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { signOut } from "next-auth/react";
import { useEffect } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import I18nProvider from "@/app/components/I18nProvider";

const { t, i18n } = useTranslation('auth');
  useEffect(() => {
    signOut({ callbackUrl: "/auth/prijava" });
  }, []);
  return (
    <I18nProvider>
      <div className="flex items-center justify-center h-32 gap-2 text-blue-700 font-semibold">
        <FaSignOutAlt className="text-2xl" />
        <span>{t('logout.Odjavljujem se')}</span>
      </div>
    </I18nProvider>
  );
}