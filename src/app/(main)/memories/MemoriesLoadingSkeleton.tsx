// src/components/memories/MemoriesLoadingSkeleton.tsx
import React from 'react';

const MemoriesLoadingSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-48 bg-gray-200 rounded"></div>
      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
};

export default MemoriesLoadingSkeleton;
