"use client";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function NotFoundClient() {
  const { t } = useTranslation('notFound');
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-gray-100 to-gray-300">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 animate-bounce">
        {t("page_not_found")}
      </h1>
      <Link
        href="/"
        className="inline-block  hover:bg--red-200 text-white px-6 py-3 text-lg rounded-lg shadow transition -transform transform hover:scale-105 input-focusfocus:ring-red-500 focus:ring-opacity-50"
      >
        {t("back_to_home")}
      </Link>
    </main>
  );
}
