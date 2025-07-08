import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface ProgressMessage {
  type: 'progress';
  message: string;
  timestamp: Date;
}

interface FinalResponseMessage {
  type: 'final';
  message: string;
  timestamp: Date;
  isAskingForMoreInformation?: boolean;
  screenshotsWithUrls?: { originalUrl: string; screenshotUrl: string }[];
}

interface ErrorMessage {
  error: string;
  timestamp: Date;
}

interface AgentActionMessage {
  type: 'agent-action';
  action: 'searching' | 'analyzing' | 'visiting' | 'completed';
  details: {
    description: string;
    metadata?: {
      query?: string;
      source?: string;
      count?: number;
      sources?: string[];
      duration?: string;
      error?: string;
      [key: string]: any;
    };
  };
  timestamp: Date;
}

interface UseAgentWebSocketProps {
  conversationId?: string;
  onProgress?: (message: ProgressMessage) => void;
  onFinalResponse?: (message: FinalResponseMessage) => void;
  onError?: (error: ErrorMessage) => void;
  onAgentAction?: (action: AgentActionMessage) => void;
}

// Singleton socket instance
let socketInstance: Socket | null = null;
let socketRefCount = 0;

const getSocket = (): Socket => {
  if (!socketInstance) {
    const socketUrl = process.env.NEXT_PUBLIC_BASE_URL_BACKEND || 'http://localhost:4000';
    console.log('🔌 Creating new WebSocket connection to:', socketUrl);

    socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }

  socketRefCount++;
  console.log('📊 Socket reference count:', socketRefCount);
  return socketInstance;
};

const releaseSocket = () => {
  socketRefCount--;
  console.log('📊 Socket reference count:', socketRefCount);

  if (socketRefCount === 0 && socketInstance) {
    console.log('🔌 Closing WebSocket connection');
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export const useAgentWebSocket = ({
  conversationId,
  onProgress,
  onFinalResponse,
  onError,
  onAgentAction,
}: UseAgentWebSocketProps) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef<{
    onProgress?: (message: ProgressMessage) => void;
    onFinalResponse?: (message: FinalResponseMessage) => void;
    onError?: (error: ErrorMessage) => void;
    onAgentAction?: (action: AgentActionMessage) => void;
  }>({});

  // Update handlers ref
  useEffect(() => {
    handlersRef.current = { onProgress, onFinalResponse, onError, onAgentAction };
  }, [onProgress, onFinalResponse, onError, onAgentAction]);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    const handleConnect = () => {
      console.log('✅ Connected to WebSocket server');
      console.log('Socket ID:', socket.id);
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log('❌ Disconnected from WebSocket server');
      setIsConnected(false);
      setCurrentRoom(null);
    };

    const handleRoomJoined = ({
      conversationId: roomId,
      status,
    }: {
      conversationId: string;
      status: string;
    }) => {
      console.log('🚪 Room join response:', { roomId, status });
      if (status === 'success') {
        console.log(`✅ Successfully joined room: ${roomId}`);
        setCurrentRoom(roomId);
      }
    };

    const handleAgentProgress = (message: ProgressMessage) => {
      console.log('📊 Progress:', message);
      handlersRef.current.onProgress?.(message);
    };

    const handleAgentResponse = (message: FinalResponseMessage) => {
      console.log('✅ Final response:', message);
      handlersRef.current.onFinalResponse?.(message);
    };

    const handleAgentError = (error: ErrorMessage) => {
      console.error('❌ Agent error:', error);
      handlersRef.current.onError?.(error);
    };

    const handleAgentAction = (action: AgentActionMessage) => {
      console.log('🎯 Agent action:', action);
      handlersRef.current.onAgentAction?.(action);
    };

    const handleConnectError = (error: Error) => {
      console.error('🔴 Connection error:', error.message);
    };

    // Check if already connected
    if (socket.connected) {
      handleConnect();
    }

    // Add event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('room-joined', handleRoomJoined);
    socket.on('agent-progress', handleAgentProgress);
    socket.on('agent-response', handleAgentResponse);
    socket.on('agent-error', handleAgentError);
    socket.on('agent-action', handleAgentAction);
    socket.on('connect_error', handleConnectError);

    return () => {
      console.log('🧹 Cleaning up WebSocket listeners');
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('room-joined', handleRoomJoined);
      socket.off('agent-progress', handleAgentProgress);
      socket.off('agent-response', handleAgentResponse);
      socket.off('agent-error', handleAgentError);
      socket.off('agent-action', handleAgentAction);
      socket.off('connect_error', handleConnectError);

      releaseSocket();
    };
  }, []); // Empty dependency array - only run once

  // Handle room changes
  useEffect(() => {
    console.log('🔄 Room change effect triggered:', { conversationId, isConnected, currentRoom });

    if (conversationId && socketRef.current && isConnected) {
      // Don't rejoin if already in the same room
      if (currentRoom === conversationId) {
        console.log(`📍 Already in room: ${conversationId}`);
        return;
      }

      if (currentRoom) {
        console.log(`🚪 Leaving previous room: ${currentRoom}`);
        socketRef.current.emit('leave-room', currentRoom);
      }

      // Join new room
      console.log(`🚪 Attempting to join room: ${conversationId}`);
      socketRef.current.emit('join-room', conversationId);
    }
  }, [conversationId, isConnected, currentRoom]);

  const joinRoom = useCallback(
    (roomId: string) => {
      if (socketRef.current && isConnected && currentRoom !== roomId) {
        socketRef.current.emit('join-room', roomId);
      }
    },
    [isConnected, currentRoom]
  );

  const leaveRoom = useCallback(
    (roomId: string) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit('leave-room', roomId);
        if (currentRoom === roomId) {
          setCurrentRoom(null);
        }
      }
    },
    [isConnected, currentRoom]
  );

  return {
    isConnected,
    currentRoom,
    joinRoom,
    leaveRoom,
  };
};
