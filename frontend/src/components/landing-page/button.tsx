import * as Headless from '@headlessui/react';
import { clsx } from 'clsx';
import { Link } from './link';

const variants = {
  primary: clsx(
    'inline-flex items-center justify-center px-4 py-2',
    'rounded-lg text-base leading-6 font-medium',
    'bg-gray-950 text-white',
    'border border-gray-950',
    'hover:bg-gray-800 hover:border-gray-800',
    'disabled:opacity-50',
    'transition-colors'
  ),
  secondary: clsx(
    'relative inline-flex items-center justify-center px-4 py-2',
    'rounded-lg text-base leading-6 font-medium',
    'bg-white text-gray-950',
    'border border-gray-300',
    'hover:bg-gray-50 hover:border-gray-950',
    'disabled:opacity-50',
    'transition-colors'
  ),
  outline: clsx(
    'inline-flex items-center justify-center px-2 py-1.5',
    'rounded-lg text-base leading-6 font-medium',
    'bg-transparent text-gray-950',
    'border border-gray-300',
    'hover:bg-gray-50 hover:border-gray-950',
    'disabled:opacity-50',
    'transition-colors'
  ),
  ghost: clsx(
    'inline-flex items-center justify-center px-2 py-1.5',
    'rounded-lg text-base leading-6 font-medium',
    'bg-transparent text-gray-950',
    'border border-transparent',
    'hover:bg-gray-100',
    'disabled:opacity-50',
    'transition-colors'
  ),
};

type ButtonProps = {
  variant?: keyof typeof variants;
} & (React.ComponentPropsWithoutRef<typeof Link> | (Headless.ButtonProps & { href?: undefined }));

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  className = clsx(className, variants[variant]);

  if (typeof props.href === 'undefined') {
    return <Headless.Button {...props} className={className} />;
  }

  return <Link {...props} className={className} />;
}
