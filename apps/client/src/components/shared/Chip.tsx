import React from 'react';
import { twMerge } from 'tailwind-merge';

type ChipSize = 'small' | 'medium' | 'large';

interface ChipProps {
  amount: number;
  className?: string;
  size?: ChipSize;
}

export const Chip = ({ amount, className, size = 'medium' }: ChipProps) => {
  const sizeClasses = {
    small: 'w-8 h-8 text-[10px]',
    medium: 'w-10 h-10 text-xs',
    large: 'w-12 h-12 text-sm',
  };

  return (
    <div
      className={twMerge(
        'inline-flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold shadow',
        'relative after:absolute after:inset-0 after:rounded-full after:shadow-[0_0_10px_rgba(59,130,246,0.5)] after:opacity-75',
        sizeClasses[size],
        className,
      )}
    >
      <span className="relative z-10">
        ${amount}
      </span>
    </div>
  );
};
