import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { config } from '../config/config';

export interface ProgressMessage {
  type: 'progress';
  message: string;
  timestamp: Date;
}

export interface FinalResponseMessage {
  type: 'final';
  message: string;
  timestamp: Date;
  isAskingForMoreInformation: boolean;
  screenshotsWithUrls?: { originalUrl: string; screenshotUrl: string }[];
}

export interface AgentActionMessage {
  type: 'agent-action';
  action: 'searching' | 'analyzing' | 'visiting' | 'completed';
  details: {
    description: string;
    metadata?: {
      query?: string;
      source?: string;
      count?: number;
      [key: string]: any;
    };
  };
  timestamp: Date;
}

export type AgentMessage = ProgressMessage | FinalResponseMessage | AgentActionMessage;

export class SocketIOService {
  private static instance: SocketIOService;
  private io: SocketIOServer | null = null;

  private constructor() {}

  static getInstance(): SocketIOService {
    if (!SocketIOService.instance) {
      SocketIOService.instance = new SocketIOService();
    }
    return SocketIOService.instance;
  }

  initialize(httpServer: HttpServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: config.cors.origin,
        methods: ['GET', 'POST'],
      },
    });

    this.setupEventHandlers();
    console.log('⚡️[socket.io]: Socket.IO server initialized');
  }

  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      console.log(`👤 New client connected: ${socket.id}`);

      // Join a specific room based on conversation ID
      socket.on('join-room', (conversationId: string) => {
        void socket.join(conversationId);
        console.log(`🚪 Client ${socket.id} joined room: ${conversationId}`);

        // Send acknowledgment
        socket.emit('room-joined', { conversationId, status: 'success' });
      });

      // Leave a room
      socket.on('leave-room', (conversationId: string) => {
        void socket.leave(conversationId);
        console.log(`🚪 Client ${socket.id} left room: ${conversationId}`);
      });

      socket.on('disconnect', () => {
        console.log(`👤 Client disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Send a progress message to a specific room
   */
  sendProgress(conversationId: string, message: string): void {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    const progressMessage: ProgressMessage = {
      type: 'progress',
      message,
      timestamp: new Date(),
    };

    // Check how many clients are in the room
    const room = this.io.sockets.adapter.rooms.get(conversationId);
    const clientCount = room ? room.size : 0;
    console.log(`📊 Room ${conversationId} has ${clientCount} clients`);

    this.io.to(conversationId).emit('agent-progress', progressMessage);
    console.log(`📤 Progress sent to room ${conversationId}: ${message}`);
  }

  /**
   * Send the final response to a specific room
   */
  sendFinalResponse({
    conversationId,
    message,
    isAskingForMoreInformation,
    screenshotsWithUrls,
  }: {
    conversationId: string;
    message: string;
    isAskingForMoreInformation: boolean;
    screenshotsWithUrls: { originalUrl: string; screenshotUrl: string }[];
  }): void {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    const finalMessage: FinalResponseMessage = {
      type: 'final',
      message,
      timestamp: new Date(),
      isAskingForMoreInformation,
      screenshotsWithUrls,
    };

    // Check how many clients are in the room
    const room = this.io.sockets.adapter.rooms.get(conversationId);
    const clientCount = room ? room.size : 0;
    console.log(`📊 Room ${conversationId} has ${clientCount} clients`);

    this.io.to(conversationId).emit('agent-response', finalMessage);
    console.log(`📤 Final response sent to room ${conversationId}`);
  }

  /**
   * Send a detailed agent action event to a specific room
   */
  sendAgentAction(
    conversationId: string,
    action: AgentActionMessage['action'],
    description: string,
    metadata?: AgentActionMessage['details']['metadata']
  ): void {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    const actionMessage: AgentActionMessage = {
      type: 'agent-action',
      action,
      details: {
        description,
        metadata,
      },
      timestamp: new Date(),
    };

    this.io.to(conversationId).emit('agent-action', actionMessage);
    console.log(`📤 Agent action sent to room ${conversationId}: ${action} - ${description}`);
  }

  /**
   * Send a generic message to a specific room
   */
  sendToRoom(conversationId: string, event: string, data: any): void {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    this.io.to(conversationId).emit(event, data);
  }

  /**
   * Get the Socket.IO server instance
   */
  getIO(): SocketIOServer | null {
    return this.io;
  }
}
