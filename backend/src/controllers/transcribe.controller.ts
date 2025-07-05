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
}
