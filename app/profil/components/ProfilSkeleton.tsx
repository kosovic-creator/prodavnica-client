"use client";

export default function ProfilSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center animate-pulse">
      <div className="max-w-2xl w-full px-4">
        <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8" />
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(2)].map((_, colIdx) => (
              <div className="space-y-3" key={colIdx}>
                {[...Array(5)].map((_, i) => (
                  <div className="bg-gray-50 p-3 rounded-lg" key={i}>
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                    <div className="h-5 bg-gray-200 rounded w-2/3" />
                  </div>
                ))}
                {colIdx === 1 && (
                  <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t">
                    <div className="h-12 bg-gray-200 rounded w-full sm:w-1/2" />
                    <div className="h-12 bg-gray-200 rounded w-full sm:w-1/2" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}