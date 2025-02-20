import React from 'react';
import { twMerge } from 'tailwind-merge';

export const Chip = ({ amount, className }: { amount: number; className?: string }) => (
  <div
    className={twMerge(
      'inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold text-xs shadow',
      'relative after:absolute after:inset-0 after:rounded-full after:shadow-[0_0_10px_rgba(59,130,246,0.5)] after:opacity-75',
      className,
    )}
  >
    <span className="relative z-10">
      $
      {amount}
    </span>
  </div>
);
