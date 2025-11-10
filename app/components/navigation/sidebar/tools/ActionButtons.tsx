'use client';

import React from 'react';

interface ActionButtonsProps {
  onShowHelp?: () => void;
}

export function ActionButtons({ onShowHelp }: ActionButtonsProps) {
  if (!onShowHelp) return null;

  return (
    <button
      onClick={onShowHelp}
      className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-150"
      title="Keyboard shortcuts & help"
    >
      Help
    </button>
  );
}


