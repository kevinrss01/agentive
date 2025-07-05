'use client';

import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  useDisclosure,
} from '@heroui/react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { MdHistory } from 'react-icons/md';
import Link from 'next/link';

type Conversation = {
  id: string;
  topic: string;
  createdAt: Date;
  uuid: string;
};

export default function ConversationsHistory() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { accessToken } = useAuth();

  const { data: conversations, error } = useQuery({
    queryKey: ['conversationsHistory'],
    queryFn: async () => {
      const response = await fetch(`http://localhost:4000/api/conversations`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      return data.data;
    },
    enabled: !!accessToken,
  });

  return (
    <>
      <div className="fixed top-2 left-2">
        <Button
          onPress={onOpen}
          size="sm"
          startContent={<MdHistory className="size-4" />}
          variant="flat"
          className="bg-black text-white mt-2 ml-3"
        >
          Conversations history
        </Button>
      </div>
      <Drawer isOpen={isOpen} placement="left" onOpenChange={onOpenChange}>
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center w-full">
                  <h2 className="text-lg font-semibold">Conversations</h2>
                </div>
              </DrawerHeader>
              <DrawerBody className="p-0">
                {conversations && conversations.length > 0 ? (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {conversations.map((conversation: Conversation) => (
                      <div
                        key={conversation.id}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                        onClick={() => onClose()}
                      >
                        <Link href={`/app/${conversation.uuid}`}>
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {conversation.topic}
                            </h3>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2"></span>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full py-12">
                    <p className="text-gray-500 dark:text-gray-400 text-center">
                      No conversations yet.
                      <br />
                      Start a new conversation to see it here.
                    </p>
                  </div>
                )}
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
