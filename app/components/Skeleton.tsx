import React from 'react';

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded w-full h-6 ${className}`}></div>
);

export default Skeleton;
