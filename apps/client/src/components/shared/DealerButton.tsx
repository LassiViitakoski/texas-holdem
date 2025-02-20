import React from 'react';
import { twMerge } from 'tailwind-merge';

export const DealerButton = ({ className }: { className?: string }) => (
  <div
    className={twMerge(
      'w-5 h-5 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center shadow',
      className,
    )}
  >
    Dealer Button
  </div>
);
