'use client';

import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { Subheading } from './text';

export function BentoCard({
  dark = false,
  className = '',
  eyebrow,
  title,
  description,
  graphic,
  fade = [],
}: {
  dark?: boolean;
  className?: string;
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  graphic: React.ReactNode;
  fade?: ('top' | 'bottom')[];
}) {
  return (
    <motion.div
      initial="idle"
      whileHover="active"
      variants={{ idle: {}, active: {} }}
      className={clsx(
        className,
        'group relative flex flex-col overflow-hidden rounded-lg',
        dark ? 'bg-gray-800 ring-1 ring-white/15' : 'bg-white shadow-sm ring-1 ring-black/5'
      )}
    >
      <div className="relative h-80 shrink-0">
        {graphic}
        {fade.includes('top') && (
          <div
            className={clsx(
              'absolute inset-0 bg-gradient-to-b to-50%',
              dark ? 'from-gray-800' : 'from-white'
            )}
          />
        )}
        {fade.includes('bottom') && (
          <div
            className={clsx(
              'absolute inset-0 bg-gradient-to-t to-50%',
              dark ? 'from-gray-800' : 'from-white'
            )}
          />
        )}
      </div>
      <div className="relative p-10">
        <Subheading as="h3" dark={dark}>
          {eyebrow}
        </Subheading>
        <p
          className={clsx(
            'mt-1 text-2xl font-medium tracking-tight leading-8',
            dark ? 'text-white' : 'text-gray-950'
          )}
        >
          {title}
        </p>
        <p
          className={clsx(
            'mt-2 max-w-[600px] text-sm leading-6',
            dark ? 'text-gray-400' : 'text-gray-600'
          )}
        >
          {description}
        </p>
      </div>
    </motion.div>
  );
}
