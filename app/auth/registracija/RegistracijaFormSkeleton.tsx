"use client";

export default function RegistracijaFormSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 animate-pulse">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md border border-gray-200 p-8">
        <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-8" />
        <form className="space-y-5">
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-10 bg-gray-200 rounded w-full" />
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-10 bg-gray-200 rounded w-full" />
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-10 bg-gray-200 rounded w-full" />
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-10 bg-gray-200 rounded w-full" />
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-10 bg-gray-200 rounded w-full" />
          </div>
          <div className="h-10 bg-gray-200 rounded w-full mt-4" />
        </form>
      </div>
    </div>
  );
}