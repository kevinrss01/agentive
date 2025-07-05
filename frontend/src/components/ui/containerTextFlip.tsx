'use client';

import React, { useState, useEffect, useId } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { cn } from '@/utils/cn';

export interface ContainerTextFlipProps {
  /** Array of words to cycle through in the animation */
  words?: string[];
  /** Array of image paths corresponding to each word */
  images?: string[];
  /** Time in milliseconds between word transitions */
  interval?: number;
  /** Additional CSS classes to apply to the container */
  className?: string;
  /** Additional CSS classes to apply to the text */
  textClassName?: string;
  /** Duration of the transition animation in milliseconds */
  animationDuration?: number;
}

export function ContainerTextFlip({
  words = ['better', 'modern', 'beautiful', 'awesome'],
  images = [],
  interval = 3000,
  className,
  textClassName,
  animationDuration = 700,
}: ContainerTextFlipProps) {
  const id = useId();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [width, setWidth] = useState(100);
  const textRef = React.useRef(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const updateWidthForWord = () => {
    if (containerRef.current) {
      // Get the width of the entire container including text and image
      // @ts-ignore
      const containerWidth = containerRef.current.scrollWidth;
      setWidth(containerWidth);
    }
  };

  useEffect(() => {
    // Update width whenever the word changes
    updateWidthForWord();
  }, [currentWordIndex]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
      // Width will be updated in the effect that depends on currentWordIndex
    }, interval);

    return () => clearInterval(intervalId);
  }, [words, interval]);

  const currentImage = images[currentWordIndex];

  return (
    <motion.div
      layout
      layoutId={`words-here-${id}`}
      animate={{ width }}
      transition={{ duration: animationDuration / 2000 }}
      className={cn(
        'relative inline-block rounded-lg pt-2 pb-3 text-center text-2xl font-bold text-black md:text-4xl dark:text-white',
        '[background:linear-gradient(to_bottom,#f3f4f6,#e5e7eb)]',
        'shadow-[inset_0_-1px_#d1d5db,inset_0_0_0_1px_#d1d5db,_0_4px_8px_#d1d5db]',
        'dark:[background:linear-gradient(to_bottom,#374151,#1f2937)]',
        'dark:shadow-[inset_0_-1px_#10171e,inset_0_0_0_1px_hsla(205,89%,46%,.24),_0_4px_8px_#00000052]',
        className
      )}
      key={words[currentWordIndex]}
    >
      <div ref={containerRef} className="flex items-center justify-center gap-3 px-4">
        <motion.div
          transition={{
            duration: animationDuration / 1000,
            ease: 'easeInOut',
          }}
          className={cn('inline-block', textClassName)}
          ref={textRef}
          layoutId={`word-div-${words[currentWordIndex]}-${id}`}
        >
          <motion.div className="inline-block relative top-[1px]">
            {words[currentWordIndex].split('').map((letter, index) => (
              <motion.span
                key={index}
                initial={{
                  opacity: 0,
                  filter: 'blur(10px)',
                }}
                animate={{
                  opacity: 1,
                  filter: 'blur(0px)',
                }}
                transition={{
                  delay: index * 0.02,
                }}
              >
                {letter}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        {currentImage && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.8,
              filter: 'blur(10px)',
            }}
            animate={{
              opacity: 1,
              scale: 1,
              filter: 'blur(0px)',
            }}
            exit={{
              opacity: 0,
              scale: 0.8,
              filter: 'blur(10px)',
            }}
            transition={{
              duration: animationDuration / 1000,
              ease: 'easeInOut',
            }}
            className="relative h-8 w-8 md:h-10 md:w-10 top-[1px]"
          >
            <Image
              src={currentImage}
              alt={words[currentWordIndex]}
              fill
              className="object-contain"
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
