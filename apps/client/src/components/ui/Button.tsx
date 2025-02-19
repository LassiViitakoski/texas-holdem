import { ComponentPropsWithoutRef, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={twMerge(
          'rounded-md font-medium transition-colors',
          variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
          variant === 'secondary' && 'bg-gray-600 text-white hover:bg-gray-700',
          variant === 'outline' && 'border border-gray-300 hover:bg-gray-50',
          size === 'sm' && 'px-3 py-1.5 text-sm',
          size === 'md' && 'px-4 py-2',
          size === 'lg' && 'px-5 py-2.5 text-lg',
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button'; 