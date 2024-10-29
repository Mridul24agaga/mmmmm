// src/components/memories/MemoryItem.tsx
import React from 'react';

interface Memory {
  id: number;
  imageUrl: string;
  caption: string;
}

interface MemoryItemProps {
  memory: Memory;
}

const MemoryItem: React.FC<MemoryItemProps> = ({ memory }) => {
  return (
    <div className="memory-item">
      <img src={memory.imageUrl} alt={memory.caption} className="w-full h-auto" />
      <p className="mt-2 text-center">{memory.caption}</p>
    </div>
  );
};

export default MemoryItem;
