'use client';

import React from 'react';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

export function HelpModal({ open, onClose }: HelpModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-4 shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold">Sidebar Help</h2>
          <button onClick={onClose} className="text-xs text-gray-500">Close</button>
        </div>
        <div className="text-xs text-gray-700 dark:text-gray-300 space-y-2">
          <p>Keyboard Shortcuts:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Ctrl/Cmd + K: Focus search</li>
            <li>Ctrl/Cmd + F: Toggle favorites</li>
            <li>Esc: Clear search</li>
          </ul>
        </div>
      </div>
    </div>
  );
}


