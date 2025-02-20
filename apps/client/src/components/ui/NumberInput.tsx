import { ComponentPropsWithoutRef, forwardRef } from 'react';
import { Input } from '@/components/ui/Input';

type NumberInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'> & {
  label?: string;
  error?: string;
  min?: number;
  max?: number;
};

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (props, ref) => <Input type="number" ref={ref} {...props} />,
);

NumberInput.displayName = 'NumberInput';
