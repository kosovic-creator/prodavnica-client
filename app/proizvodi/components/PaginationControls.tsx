'use client';
import Link from 'next/link';

interface PaginationControlsProps {
  page: number;
  total: number;
  pageSize: number;
  lang: string;
  search: string;
}

export default function PaginationControls({ page, total, pageSize, lang, search }: PaginationControlsProps) {
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) return null;

  const buildUrl = (newPage: number) => {
    const params = new URLSearchParams();
    params.set('page', newPage.toString());
    params.set('pageSize', pageSize.toString());
    params.set('lang', lang);
    if (search) params.set('search', search);
    return `/proizvodi?${params.toString()}`;
  };

  return (
    <div className="mt-8 bg-white rounded-lg p-4 shadow-sm">
      <div className="flex justify-center items-center gap-3">
        <Link
          href={buildUrl(page - 1)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            page === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Prethodna
        </Link>

        <div className="px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
          <span className="hidden sm:inline">{page} od {totalPages}</span>
          <span className="sm:hidden">{page}/{totalPages}</span>
        </div>

        <Link
          href={buildUrl(page + 1)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            page >= totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Sledeća
        </Link>
      </div>
    </div>
  );
}