'use client';
import React from 'react';
import { HomeIcon, Cog6ToothIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { FloatingNav } from './floatingNavbar';
import { Logo } from '../landing-page/logo';
import { motion } from 'framer-motion';
import ConnectionStatus from './ConnectionStatus';

const Navbar = () => {
  const navItems = [
    {
      name: 'Home',
      link: '/app',
      icon: <HomeIcon className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: 'Settings',
      link: '/settings',
      icon: <Cog6ToothIcon className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: 'Contact',
      link: '/contact',
      icon: <ChatBubbleLeftIcon className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
  ];

  return (
    <motion.div
      className="relative w-full"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="absolute top-4 right-4 z-40">
        <ConnectionStatus />
      </div>
      <FloatingNav navItems={navItems} logo={<Logo className="h-6" />} />
    </motion.div>
  );
};

export default Navbar;
