interface SearchInfoProps {
  search: string;
  resultsCount: number;
}

export default function SearchInfo({ search, resultsCount }: SearchInfoProps) {
  if (!search) return null;

  return (
    <div className="mb-6 p-4 bg-blue-100 border-l-4 border-blue-500 rounded-lg">
      <p className="text-blue-700 text-sm md:text-base">
        Rezultati pretrage za: <strong>&quot;{search}&quot;</strong>
        <span className="ml-2 text-xs md:text-sm">({resultsCount} artikli)</span>
      </p>
    </div>
  );
}