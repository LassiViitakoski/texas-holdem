import { Input } from '@/components/ui/Input';
import { ComponentPropsWithoutRef, forwardRef } from 'react';

type NumberInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'> & {
  label?: string;
  error?: string;
  min?: number;
  max?: number;
};

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (props, ref) => {
    return <Input type="number" ref={ref} {...props} />;
  }
);

NumberInput.displayName = 'NumberInput'; 