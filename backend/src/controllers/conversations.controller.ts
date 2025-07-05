import { JWTAuthenticatedRequest } from '@/middlewares/auth.middleware';
import { Response } from 'express';
import { ConversationsService } from '@/services/conversations.service';
import { UUID } from 'crypto';

export class ConversationsController {
  #conversationsService = new ConversationsService();

  index = async (req: JWTAuthenticatedRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { data, error } = await this.#conversationsService.userConversations(req.user.id);

    if (error) res.status(500).json({ error: error.message });

    res.status(200).json({ data });
  };

  show = async (req: JWTAuthenticatedRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const conversationUUID = req.params.conversationUUID as UUID;

    const { data, error } = await this.#conversationsService.conversationMessages(conversationUUID);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(200).json({ data });
  };
}
