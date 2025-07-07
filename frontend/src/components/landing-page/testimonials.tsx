'use client';

import * as Headless from '@headlessui/react';
import { ArrowLongRightIcon } from '@heroicons/react/20/solid';
import { clsx } from 'clsx';
import {
  MotionValue,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  type HTMLMotionProps,
} from 'framer-motion';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import useMeasure, { type RectReadOnly } from 'react-use-measure';
import { Container } from './container';
import { Link } from './link';
import { Heading, Subheading } from './text';

const testimonials = [
  {
    img: '/testimonials/tina-yards.jpg',
    name: 'Sarah Chen',
    title: 'Travel Enthusiast, San Francisco',
    quote:
      'Agentive found me a hidden gem hotel in Tokyo and the perfect omakase restaurant nearby. Saved hours of research and got better results than any travel site.',
  },
  {
    img: '/testimonials/conor-neville.jpg',
    name: 'Michael Torres',
    title: 'Food Blogger, New York',
    quote:
      "From Michelin stars to hole-in-the-wall spots, Agentive always finds exactly what I'm craving. It even remembers I'm gluten-free.",
  },
  {
    img: '/testimonials/amy-chase.jpg',
    name: 'Emma Watson',
    title: 'Smart Shopper, London',
    quote:
      'Saved £3000 last year just on shopping. Agentive finds deals I never knew existed and tracks prices until they drop.',
  },
  {
    img: '/testimonials/veronica-winton.jpg',
    name: 'Lisa Park',
    title: 'Busy Mom, Seattle',
    quote:
      "One AI for everything - planning trips, finding kid-friendly restaurants, and shopping for the best deals. It\'s like having a personal assistant.",
  },
  {
    img: '/testimonials/dillon-lenora.jpg',
    name: 'James Miller',
    title: 'Business Professional, Austin',
    quote:
      'Books my flights, finds restaurants for client dinners, and even helps me shop for gifts. Agentive handles it all perfectly.',
  },
  {
    img: '/testimonials/harriet-arron.jpg',
    name: 'Rachel Kim',
    title: 'Lifestyle Curator, Miami',
    quote:
      "The AI learns my style. Whether I\'m planning a trip, finding a new restaurant, or shopping for clothes - it knows exactly what I want.",
  },
];

function TestimonialCard({
  name,
  title,
  img,
  children,
  bounds,
  scrollX,
  ...props
}: {
  img: string;
  name: string;
  title: string;
  children: React.ReactNode;
  bounds: RectReadOnly;
  scrollX: MotionValue<number>;
} & HTMLMotionProps<'div'>) {
  const ref = useRef<HTMLDivElement | null>(null);

  const computeOpacity = useCallback(() => {
    const element = ref.current;
    if (!element || bounds.width === 0) return 1;

    const rect = element.getBoundingClientRect();

    if (rect.left < bounds.left) {
      const diff = bounds.left - rect.left;
      const percent = diff / rect.width;
      return Math.max(0.5, 1 - percent);
    } else if (rect.right > bounds.right) {
      const diff = rect.right - bounds.right;
      const percent = diff / rect.width;
      return Math.max(0.5, 1 - percent);
    } else {
      return 1;
    }
  }, [ref, bounds.width, bounds.left, bounds.right]);

  const opacity = useSpring(computeOpacity(), {
    stiffness: 154,
    damping: 23,
  });

  useLayoutEffect(() => {
    opacity.set(computeOpacity());
  }, [computeOpacity, opacity]);

  useMotionValueEvent(scrollX, 'change', () => {
    opacity.set(computeOpacity());
  });

  return (
    <motion.div
      ref={ref}
      style={{ opacity }}
      {...props}
      className="relative flex aspect-9/16 w-72 shrink-0 snap-start scroll-ml-6 lg:scroll-ml-8 flex-col justify-end overflow-hidden rounded-3xl sm:aspect-3/4 sm:w-96"
    >
      <img
        alt=""
        src={img}
        className="absolute inset-x-0 top-0 aspect-square w-full object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black from-[calc(7/16*100%)] ring-1 ring-gray-950/10 ring-inset sm:from-25%"
      />
      <figure className="relative p-10">
        <blockquote>
          <p className="relative text-xl/7 text-white">
            <span aria-hidden="true" className="absolute -translate-x-full">
              &ldquo;
            </span>
            {children}
            <span aria-hidden="true" className="absolute">
              &rdquo;
            </span>
          </p>
        </blockquote>
        <figcaption className="mt-6 border-t border-white/20 pt-6">
          <p className="text-sm/6 font-medium text-white">{name}</p>
          <p className="text-sm/6 font-medium">
            <span className="bg-gradient-to-r from-[#fff1be] from-28% via-[#ee87cb] via-70% to-[#b060ff] bg-clip-text text-transparent">
              {title}
            </span>
          </p>
        </figcaption>
      </figure>
    </motion.div>
  );
}

function CallToAction() {
  return (
    <div>
      <p className="max-w-sm text-sm/6 text-gray-600">
        Join thousands of happy travelers who've discovered the smarter way to plan their perfect
        trips.
      </p>
      <div className="mt-2">
        <Link
          href="/app"
          className="inline-flex items-center gap-2 text-sm/6 font-medium text-pink-600"
        >
          Start your journey
          <ArrowLongRightIcon className="size-5" />
        </Link>
      </div>
    </div>
  );
}

export function Testimonials() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { scrollX } = useScroll({ container: scrollRef });
  const [setReferenceWindowRef, bounds] = useMeasure();
  const [activeIndex, setActiveIndex] = useState(0);

  useMotionValueEvent(scrollX, 'change', (x) => {
    setActiveIndex(Math.floor(x / scrollRef.current!.children[0].clientWidth));
  });

  function scrollTo(index: number) {
    const gap = 32;
    const width = (scrollRef.current!.children[0] as HTMLElement).offsetWidth;
    scrollRef.current!.scrollTo({ left: (width + gap) * index });
  }

  return (
    <div className="overflow-hidden py-32">
      <Container>
        <div ref={setReferenceWindowRef}>
          <Subheading>Testimonials</Subheading>
          <Heading as="h3" className="mt-2">
            Loved by travelers worldwide.
          </Heading>
        </div>
      </Container>
      <div
        ref={scrollRef}
        className={clsx([
          'mt-16 flex gap-8 px-6 lg:px-8',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          'snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth',
        ])}
      >
        {testimonials.map(({ img, name, title, quote }, testimonialIndex) => (
          <TestimonialCard
            key={testimonialIndex}
            name={name}
            title={title}
            img={img}
            bounds={bounds}
            scrollX={scrollX}
            onClick={() => scrollTo(testimonialIndex)}
          >
            {quote}
          </TestimonialCard>
        ))}
        <div className="w-[32rem] shrink-0 sm:w-[54rem]" />
      </div>
      <Container className="mt-16">
        <div className="flex justify-between">
          <CallToAction />
          <div className="hidden sm:flex sm:gap-2">
            {testimonials.map(({ name }, testimonialIndex) => (
              <Headless.Button
                key={testimonialIndex}
                onClick={() => scrollTo(testimonialIndex)}
                aria-label={`Scroll to testimonial from ${name}`}
                className={clsx(
                  'size-2.5 rounded-full border border-transparent bg-gray-300 transition hover:bg-gray-400',
                  activeIndex === testimonialIndex && 'bg-gray-400'
                )}
              />
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
