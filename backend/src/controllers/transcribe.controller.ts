import { AssistantOrchestratorService } from '@/services/assistantOrchestrator.service';
import { Request, Response } from 'express';
import { JWTAuthenticatedRequest } from '@/middlewares/auth.middleware';
import { z } from 'zod';
import crypto from 'crypto';
import { ConversationsService } from '@/services/conversations.service';

const textValidator = z.object({
  data: z.string().min(1, 'The text data must not be empty').trim(),
  uuid: z.string().uuid().optional(),
});

const conversationMessageValidator = z.object({
  id: z.string(),
  type: z.enum(['text', 'audio']),
  content: z.string().optional(),
  role: z.enum(['assistant', 'user']),
  timestamp: z.string().datetime(),
});

const conversationValidator = z.object({
  conversationId: z.string().uuid(),
  newMessage: z.string().min(1, 'The new message must not be empty').trim(),
  conversationHistory: z
    .array(conversationMessageValidator)
    .min(1, 'Conversation history must have at least one message'),
});

export type AudioFile = {
  buffer: Buffer;
  mimetype: string;
  originalname?: string;
  size: number;
};

export class TranscribeController {
  private assistantOrchestratorService = new AssistantOrchestratorService();
  private conversationsService = new ConversationsService();

  private extractInput(req: Request) {
    const input: { text?: string; audioFile?: AudioFile; uuid?: string } = {};

    if (req.body) {
      const result = textValidator.safeParse(req.body);
      if (result.success) {
        input.text = result.data.data;
        input.uuid = result.data.uuid;
      }
    }

    if (req.file && req.file.mimetype.startsWith('audio/')) {
      input.audioFile = {
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        originalname: req.file.originalname,
        size: req.file.size,
      };
    }

    return input;
  }

  process = async (req: JWTAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const input = this.extractInput(req);
      if (!input.text && !input.audioFile) {
        res
          .status(400)
          .json({ error: 'No valid input provided. Please provide either text or an audio file.' });
        return;
      }

      const uuid = input.uuid || crypto.randomUUID();

      const userQuery = await this.assistantOrchestratorService.getTextFromInput(input);

      // Add a delay before processing to allow frontend to connect
      setTimeout(() => {
        this.assistantOrchestratorService.processRequest(userQuery, uuid).catch((error) => {
          console.error('Error processing request:', error);
        });
      }, 3000);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (req.body.conversationNew) {
        await this.conversationsService.createConversationWithMessage({
          topic: userQuery,
          user_id: req.user.id,
          content: userQuery,
          uuid,
        });
      }

      res.json({
        conversationId: uuid,
        initialMessage: userQuery,
        userId: req.user.uuid,
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: error instanceof Error ? error.message : 'Internal server error' });
    }
  };

  // eslint-disable-next-line @typescript-eslint/require-await
  processWithHistory = async (req: JWTAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const validationResult = conversationValidator.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Invalid request format',
          details: validationResult.error.issues,
        });
        return;
      }

      const {
        conversationId,
        newMessage,
        conversationHistory: _conversationHistory,
      } = validationResult.data;

      // Add a delay before processing to allow frontend to connect
      setTimeout(() => {
        this.assistantOrchestratorService
          .processNewMessage({
            conversationHistory: _conversationHistory.map((message) => ({
              ...message,
              timestamp: new Date(message.timestamp),
            })),
            newMessage,
            conversationId,
            user: req.user,
          })
          .catch((error) => {
            console.error('Error processing conversation request:', error);
          });
      }, 1000);

      res.json({
        conversationId,
        message: newMessage,
        userId: req.user.uuid,
        status: 'processing',
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: error instanceof Error ? error.message : 'Internal server error' });
    }
  };
}
