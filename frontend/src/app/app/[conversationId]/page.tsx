'use client';

import { useConversation, ConversationMessage } from '@/hooks/useConversation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import DOMPurify from 'dompurify';
import { Input } from '@heroui/react';
import { IoSend } from 'react-icons/io5';
import { ExclamationTriangleIcon } from '@heroicons/react/16/solid';
import { useAuth } from '@/hooks/useAuth';
import { MicrophoneIcon } from '@heroicons/react/24/outline';
import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';

function ChatBubble({ message }: { message: ConversationMessage }) {
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

        {/* Display screenshots above the bubble */}
        {message.screenshotsWithUrls && message.screenshotsWithUrls.length > 0 && !user && (
          <div className="mb-3 space-y-2">
            <div className="text-xs text-gray-500 mb-2">
              📸 Screenshots ({message.screenshotsWithUrls.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
              {message.screenshotsWithUrls.map((item, index) => {
                const handleClick = () => {
                  console.log('Screenshot clicked, item:', item);
                  console.log('Original URL:', item.originalUrl);

                  if (!item.originalUrl) {
                    console.error('No original URL found');
                    return;
                  }

                  // Ensure URL has protocol
                  let url = item.originalUrl;
                  if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    url = 'https://' + url;
                  }

                  console.log('Opening URL:', url);
                  try {
                    window.open(url, '_blank', 'noopener,noreferrer');
                  } catch (error) {
                    console.error('Error opening URL:', error);
                  }
                };

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="relative group cursor-pointer"
                    onClick={handleClick}
                  >
                    <img
                      src={item.screenshotUrl}
                      alt={`Screenshot of ${item.originalUrl}`}
                      className="w-full h-40 sm:h-48 object-cover rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-opacity flex items-center justify-center pointer-events-none">
                      <div className="opacity-0 group-hover:opacity-100 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded transition-opacity">
                        Visit website
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 rounded-b-lg pointer-events-none">
                      <p className="text-white text-xs truncate" title={item.originalUrl}>
                        {item.originalUrl}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

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

const ChatInterface = ({ messages }: { messages: ConversationMessage[] }) => {
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
  const [inputValue, setInputValue] = useState('');
  const { accessToken } = useAuth();

  const { messages, isLoading, error, isConnected, addMessage, isProcessing } =
    useConversation(conversationId);

  const sendMessage = async (message: string) => {
    if (!message.trim() || !accessToken || isProcessing) return;

    // Add the user message to the local state immediately
    addMessage({
      type: 'text',
      role: 'user',
      content: message,
    });

    try {
      // Check if the last AI message is asking for more information
      const lastAssistantMessage = messages
        .filter((msg) => msg.role === 'assistant' && !msg.isProgress)
        .slice(-1)[0];

      const isAskingForMoreInfo = lastAssistantMessage?.isAskingForMoreInformation;

      // Prepare conversation history for API
      const conversationHistory = messages.map((msg) => ({
        id: String(msg.id),
        type: msg.type || 'text',
        content: msg.content || '',
        role: msg.role,
        timestamp: msg.timestamp.toISOString(),
      }));

      // Choose the appropriate route based on whether AI is asking for more info

      const endpoint = isAskingForMoreInfo
        ? `${process.env.NEXT_PUBLIC_BASE_URL_BACKEND}/api/transcribe`
        : `${process.env.NEXT_PUBLIC_BASE_URL_BACKEND}/api/transcribe/conversation`;

      let body;
      if (isAskingForMoreInfo) {
        const allUserMessages = [
          ...messages.filter((msg) => msg.role === 'user').map((msg) => msg.content || ''),
          message,
        ].join('\n\n');

        body = {
          data: allUserMessages,
          uuid: conversationId,
          message: message,
        };
      } else {
        body = {
          conversationId,
          newMessage: message,
          conversationHistory,
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Message sent successfully:', result);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || isProcessing) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-500">Error while loading messages: {error.message}</div>
        </div>
      ) : (
        <ChatInterface messages={messages} />
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <Input
            value={inputValue}
            onValueChange={setInputValue}
            onKeyDown={handleKeyPress}
            placeholder={isProcessing ? 'AI is processing...' : 'Type your message...'}
            size="lg"
            variant="bordered"
            isDisabled={isProcessing}
            endContent={
              <div
                className={`cursor-pointer ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleSendMessage}
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
