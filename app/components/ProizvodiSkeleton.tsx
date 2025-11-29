import React from 'react';

// Single product card skeleton
export function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col shadow-sm relative">
      {/* Favorites button skeleton */}
      <div className="absolute top-3 right-3 z-10">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
      </div>

      {/* Image skeleton */}
      <div className="mb-3 flex justify-center">
        <div className="w-[100px] h-[100px] bg-gray-200 rounded-md animate-pulse"></div>
      </div>

      {/* Content skeleton */}
      <div className="flex-1 space-y-2">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        </div>

        {/* Description skeleton */}
        <div className="space-y-1">
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
        </div>

        {/* Characteristics skeleton */}
        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>

        {/* Category skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </div>

        {/* Price and quantity skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
      </div>

      {/* Buttons skeleton */}
      <div className="flex flex-col sm:flex-row gap-2 mt-4">
        <div className="flex-1 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="flex-1 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
}

// Main products page skeleton
export default function ProizvodiSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Search results info skeleton (sometimes visible) */}
        <div className="mb-6 p-4 bg-gray-100 border-l-4 border-gray-300 rounded-lg">
          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
        </div>

        {/* Products grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>

        {/* Pagination skeleton */}
        <div className="mt-8 flex justify-center items-center gap-2">
          <div className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}