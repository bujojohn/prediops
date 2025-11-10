'use client';

import React from 'react';

interface FilterButtonProps {
  icon?: React.ReactNode;
  label: string;
  active: boolean;
  count?: number;
  onClick: () => void;
  title?: string;
}

export function FilterButton({ icon, label, active, count, onClick, title }: FilterButtonProps) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-150 hover:scale-105 active:scale-95 ${
        active
          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {typeof count === 'number' && (
        <span className={`ml-1 inline-flex items-center justify-center rounded px-1.5 ${
          active ? 'bg-blue-200/70 text-blue-900' : 'bg-gray-200/70 text-gray-700'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}


