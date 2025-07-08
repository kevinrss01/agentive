import { JWTAuthenticatedRequest } from '@/middlewares/auth.middleware';
import { KnowledgeService } from '@/services/knowledge.service';
import { LlamaService } from '@/services/llama.service';
import { instructions } from '@/services/prompts/instructions';
import { Response } from 'express';

type KnowledgeInsertRequest = Omit<JWTAuthenticatedRequest, 'body'> & {
  body: {
    userMessage: string;
  };
};

type KnowledgeResult = {
  isRelevant: boolean;
  content: string;
  confidence_score: number;
};

export class KnowledgeController {
  #llamaService = new LlamaService();
  #knowledgeService = new KnowledgeService();

  knowledgeInsert = async (req: KnowledgeInsertRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { userMessage } = req.body;

    if (!userMessage) {
      res.status(400).json({ error: 'User message is required' });
      return;
    }

    const llamaResponse = await this.#llamaService.promptLlama({
      instructions: instructions.knowledgeInsertInstructions,
      prompt: userMessage,
    });

    // transform llamaResponse to valid json response
    const cleanedContent = llamaResponse
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const result = JSON.parse(cleanedContent) as KnowledgeResult;

    if (!result.isRelevant) return;

    await this.#knowledgeService.knowledgeInsert(result, req.user.id);

    res.status(200).json({ message: 'Knowledge inserted successfully' });
  };
}
