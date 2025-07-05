import { clsx } from 'clsx';

type HeadingProps = {
  as?: 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  dark?: boolean;
} & React.ComponentPropsWithoutRef<'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'>;

export function Heading({ className, as: Element = 'h2', dark = false, ...props }: HeadingProps) {
  return (
    <Element
      {...props}
      className={clsx(
        className,
        'text-4xl font-medium tracking-tighter text-pretty sm:text-6xl',
        dark ? 'text-white' : 'text-gray-950'
      )}
    />
  );
}

export function Subheading({
  className,
  as: Element = 'h2',
  dark = false,
  ...props
}: HeadingProps) {
  return (
    <Element
      {...props}
      className={clsx(
        className,
        'font-mono text-xs/5 font-semibold tracking-widest uppercase',
        dark ? 'text-gray-400' : 'text-gray-500'
      )}
    />
  );
}

export function Lead({ className, ...props }: React.ComponentPropsWithoutRef<'p'>) {
  return <p className={clsx(className, 'text-2xl font-medium text-gray-500')} {...props} />;
}
