import { useEffect, useRef, useState, useCallback } from 'react';
import { useAgentWebSocket } from '@/hooks/useAgentWebSocket';
import { useAuth } from '@/hooks/useAuth';
import { displayToast } from '@/utils/sonnerToast';

export type ConversationMessage = {
  id: string | number;
  type?: 'text' | 'audio';
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isProgress?: boolean;
  isAskingForMoreInformation?: boolean;
};

export function useConversation(conversationId: string | undefined) {
  const { accessToken, isLoading: authLoading } = useAuth();

  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const progressMessageIdRef = useRef<string>('progress');

  // Add message to local state
  const addMessage = useCallback((message: Omit<ConversationMessage, 'id' | 'timestamp'>) => {
    const newMessage: ConversationMessage = {
      id: `${message.role}-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      ...message,
    };

    setMessages((prev) => [...prev, newMessage]);

    // If it's a user message, set processing to true
    if (message.role === 'user') {
      setIsProcessing(true);
    }

    return newMessage;
  }, []);

  /** Fetch existing messages on mount / when conversationId changes */
  useEffect(() => {
    if (!conversationId) return;

    // Don't fetch if auth is still loading or if there's no access token
    if (authLoading || !accessToken) {
      return;
    }

    const controller = new AbortController();

    async function fetchMessages() {
      try {
        setIsLoading(true);
        setError(null);

        console.log('🔐 Frontend Debug: accessToken length:', accessToken?.length);
        console.log(
          '🔐 Frontend Debug: accessToken starts with:',
          accessToken?.substring(0, 20) + '...'
        );

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL_BACKEND}/api/conversations/${conversationId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
          }
        );
        if (!res.ok) {
          const errorText = await res.text();
          console.error('❌ Frontend Debug: API Error Response:', errorText);
          throw new Error('Failed to load messages');
        }
        const json = await res.json();
        // Assume json.data already matches the expected shape except timestamp
        const initial: ConversationMessage[] = json.data.map((m: any) => ({
          id: m.id,
          type: m.type || 'text',
          role: m.role,
          content: m.content,
          timestamp: new Date(m.created_at),
        }));
        setMessages(initial);
      } catch (err: any) {
        console.error(err.message);
        if (err.name !== 'AbortError') {
          setError(err);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchMessages();

    return () => controller.abort();
  }, [conversationId, accessToken, authLoading]);

  /** Handle sessionStorage initial user message (draft) */
  useEffect(() => {
    if (!conversationId) return;
    const stored = sessionStorage.getItem(`initial-message-${conversationId}`);
    if (stored) {
      setMessages((prev) => [
        {
          id: 'initial-local',
          type: 'text',
          role: 'user',
          content: stored,
          timestamp: new Date(),
        },
        ...prev,
      ]);
      sessionStorage.removeItem(`initial-message-${conversationId}`);
    }
  }, [conversationId]);

  /** WebSocket integration for progress & final messages */
  const { isConnected } = useAgentWebSocket({
    conversationId,
    onProgress: (progress) => {
      setIsProcessing(true);
      setMessages((prev) => {
        const newMsg: ConversationMessage = {
          id: progressMessageIdRef.current,
          type: 'text',
          role: 'assistant',
          content: progress.message,
          timestamp: new Date(progress.timestamp),
          isProgress: true,
        };
        // Replace or append
        const idx = prev.findIndex((m) => m.id === progressMessageIdRef.current);
        if (idx >= 0) {
          const clone = [...prev];
          clone[idx] = newMsg;
          return clone;
        }
        return [...prev, newMsg];
      });
    },
    onFinalResponse: (final) => {
      setIsProcessing(false);
      setMessages((prev) => {
        const withoutProgress = prev.filter((m) => m.id !== progressMessageIdRef.current);
        return [
          ...withoutProgress,
          {
            id: `assistant-${Date.now()}`,
            type: 'text',
            role: 'assistant',
            content: final.message,
            timestamp: new Date(final.timestamp),
            isAskingForMoreInformation: final.isAskingForMoreInformation,
          },
        ];
      });
    },
    onError: (err) => {
      console.error('WebSocket error', err);
      setIsProcessing(false);
      // remove progress if exists
      setMessages((prev) => prev.filter((m) => m.id !== progressMessageIdRef.current));
    },
  });

  // Sort messages once before returning
  const sortedMessages = messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  return { messages: sortedMessages, isLoading, error, isConnected, addMessage, isProcessing };
}
