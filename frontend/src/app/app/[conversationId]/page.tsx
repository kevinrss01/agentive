'use client';

import { MicrophoneIcon } from '@heroicons/react/16/solid';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAgentWebSocket } from '@/hooks/useAgentWebSocket';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import DOMPurify from 'dompurify';
import { Input } from '@heroui/react';
import { IoSend } from 'react-icons/io5';
import { ExclamationTriangleIcon } from '@heroicons/react/16/solid';

type Message = {
  id: string;
  type: 'text' | 'audio';
  content?: string;
  role: 'assistant' | 'user';
  timestamp: Date;
  isProgress?: boolean;
  isAskingForMoreInformation?: boolean;
};

function ChatBubble({ message }: { message: Message }) {
  const user = message.role === 'user';

  return (
    <motion.div
      className={`flex ${user ? 'justify-end' : 'justify-start'} mb-4`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: 'easeOut',
      }}
    >
      <motion.div
        className={`max-w-[70%] ${user ? 'order-2' : 'order-1'} relative`}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{
          duration: 0.3,
          delay: 0.1,
          ease: 'easeOut',
        }}
      >
        <div className={`text-[11px] text-gray-500 mb-1 ${user ? 'text-right' : 'text-left'}`}>
          {user ? 'You' : 'Assistant'}
        </div>

        <div
          className={`
            px-4 py-3 rounded-2xl max-w-full break-words relative overflow-visible
            ${
              user
                ? 'bg-blue-50 text-blue-900 border border-blue-200 rounded-br-sm'
                : message.isProgress
                  ? 'bg-gray-50 text-gray-600 border border-gray-200 rounded-bl-sm'
                  : 'bg-gray-100 text-gray-900 rounded-bl-sm'
            }
          `}
        >
          {/* Warning icon for messages asking for more information */}
          {message.isAskingForMoreInformation && !user && (
            <div className="absolute -top-2 -right-2 group">
              <div className="bg-orange-500 rounded-full p-1.5 shadow-lg hover:bg-orange-600 transition-colors cursor-help">
                <ExclamationTriangleIcon className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-10 right-0 bg-orange-500 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                Needs more informations
                <div className="absolute -top-1 right-2 w-2 h-2 bg-orange-500 rotate-45"></div>
              </div>
            </div>
          )}

          {message.type === 'audio' ? (
            <div className="flex items-center gap-2">
              <MicrophoneIcon className={`w-5 h-5 ${user ? 'text-blue-700' : 'text-gray-600'}`} />
              <span className="text-sm" aria-label="Audio message">
                Audio message
              </span>
            </div>
          ) : (
            <div className="text-sm leading-relaxed">
              {message.isProgress && <span className="italic">Processing: </span>}
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(message.content || '', {
                    ALLOWED_TAGS: [
                      'p',
                      'br',
                      'strong',
                      'em',
                      'u',
                      'h1',
                      'h2',
                      'h3',
                      'h4',
                      'h5',
                      'h6',
                      'ul',
                      'ol',
                      'li',
                      'blockquote',
                      'a',
                      'img',
                      'code',
                      'pre',
                      'span',
                      'div',
                      'table',
                      'thead',
                      'tbody',
                      'tr',
                      'th',
                      'td',
                      'hr',
                      'b',
                      'i',
                    ],
                    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'id', 'target', 'rel', 'style'],
                    ALLOW_DATA_ATTR: false,
                  }),
                }}
                className={`
                  prose prose-sm max-w-none
                  ${
                    user
                      ? 'prose-blue prose-p:text-blue-900 prose-headings:text-blue-900 prose-strong:text-blue-900 prose-a:text-blue-700 prose-code:text-blue-800 prose-code:bg-blue-900/10'
                      : 'prose-gray prose-p:text-gray-900 prose-headings:text-gray-900 prose-strong:text-gray-900 prose-a:text-blue-600 prose-code:text-gray-800 prose-code:bg-black/10'
                  }
                  prose-p:my-3 prose-ul:my-3 prose-ol:my-3 prose-li:my-2 
                  prose-headings:my-3 prose-headings:font-semibold
                  prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                  prose-pre:bg-gray-100 prose-pre:text-gray-800
                  prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4
                  prose-img:rounded-lg prose-img:shadow-md
                  prose-hr:my-4
                `}
              />
            </div>
          )}
        </div>

        <div className={`text-xs text-gray-400 mt-1 ${user ? 'text-right' : 'text-left'}`}>
          {message.timestamp.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

const ChatInterface = ({ messages }: { messages: Message[] }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const progressMessage = messages.find((msg) => msg.isProgress);
  const displayMessages = messages.filter((msg) => !msg.isProgress);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 pb-40">
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="popLayout">
          {displayMessages.map((message, index) => (
            <div key={message.id}>
              <ChatBubble message={message} />
              {/* Show progress message after the last user message */}
              {message.role === 'user' && index === displayMessages.length - 1 && (
                <>
                  {progressMessage ? (
                    <motion.span
                      className={cn(
                        'bg-[linear-gradient(110deg,#bfbfbf,35%,#000,50%,#bfbfbf,75%,#bfbfbf)] dark:bg-[linear-gradient(110deg,#404040,35%,#fff,50%,#404040,75%,#404040)]',
                        'bg-[length:200%_100%] bg-clip-text text-transparent'
                      )}
                      initial={{ backgroundPosition: '200% 0' }}
                      animate={{ backgroundPosition: '-200% 0' }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 2,
                        ease: 'linear',
                      }}
                    >
                      {progressMessage.content}
                    </motion.span>
                  ) : (
                    <motion.span
                      className={cn(
                        'bg-[linear-gradient(110deg,#bfbfbf,35%,#000,50%,#bfbfbf,75%,#bfbfbf)] dark:bg-[linear-gradient(110deg,#404040,35%,#fff,50%,#404040,75%,#404040)]',
                        'bg-[length:200%_100%] bg-clip-text text-transparent'
                      )}
                      initial={{ backgroundPosition: '200% 0' }}
                      animate={{ backgroundPosition: '-200% 0' }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 2,
                        ease: 'linear',
                      }}
                    >
                      Please wait...
                    </motion.span>
                  )}
                </>
              )}
            </div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const progressMessageIdRef = useRef<string | null>(null);
  const [inputValue, setInputValue] = useState<string>('');

  console.log('🎯 ConversationPage rendered with conversationId:', conversationId);

  const { isConnected, currentRoom } = useAgentWebSocket({
    conversationId,
    onProgress: (progressMessage) => {
      console.log('📨 Progress message received in page:', progressMessage);
      // Update or add progress message
      const progressId = progressMessageIdRef.current || `progress-${Date.now()}`;
      progressMessageIdRef.current = progressId;

      setMessages((prev) => {
        const existingIndex = prev.findIndex((msg) => msg.id === progressId);
        const newMessage: Message = {
          id: progressId,
          type: 'text',
          content: progressMessage.message,
          role: 'assistant',
          timestamp: new Date(progressMessage.timestamp),
          isProgress: true,
        };

        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = newMessage;
          return updated;
        }
        return [...prev, newMessage];
      });
    },
    onFinalResponse: (finalMessage) => {
      console.log('📨 Final message received in page:', finalMessage);
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== progressMessageIdRef.current);
        return [
          ...filtered,
          {
            id: `final-${Date.now()}`,
            type: 'text',
            content: finalMessage.message,
            role: 'assistant',
            timestamp: new Date(finalMessage.timestamp),
            isAskingForMoreInformation: finalMessage.isAskingForMoreInformation,
          },
        ];
      });
      progressMessageIdRef.current = null;
    },
    onError: (error) => {
      console.error('❌ WebSocket error in page:', error);
      // Remove progress message if there's an error
      if (progressMessageIdRef.current) {
        setMessages((prev) => prev.filter((msg) => msg.id !== progressMessageIdRef.current));
        progressMessageIdRef.current = null;
      }
    },
  });

  useEffect(() => {
    console.log('🔄 Conversation page effect - Connected:', isConnected, 'Room:', currentRoom);
  }, [isConnected, currentRoom]);

  useEffect(() => {
    const storedMessage = sessionStorage.getItem(`initial-message-${conversationId}`);
    console.log('💾 Stored initial message:', storedMessage);
    if (storedMessage) {
      const initialMessage: Message = {
        id: '1',
        type: 'text',
        content: storedMessage,
        role: 'user',
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
      sessionStorage.removeItem(`initial-message-${conversationId}`);
    }
  }, [conversationId]);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="border-gray-200 px-4 py-3 bg-white">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Travel Assistant</h1>
            <p className="text-sm text-gray-500">
              {isConnected ? (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Connected
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  Connecting...
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <ChatInterface messages={messages} />

      {/* HeroUI Input at the bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <Input
            value={inputValue}
            onValueChange={(e: string) => setInputValue(e)}
            placeholder="Type your message..."
            size="lg"
            variant="bordered"
            endContent={
              <div
                className="cursor-pointer"
                onClick={() => {
                  console.log('send');
                }}
              >
                <IoSend size={20} />
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
