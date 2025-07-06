import { supabase } from '@/config/supabase';
import { LlamaService } from './llama.service';
import { instructions } from './prompts/instructions';

type KnowledgeResult = {
  isRelevant: boolean;
  content: string;
  confidence_score: number;
};

export class KnowledgeService {
  private llamaService = new LlamaService();

  async evaluateMessage(message: string): Promise<KnowledgeResult> {
    const llamaResponse = await this.llamaService.promptLlama({
      instructions: instructions.knowledgeInsertInstructions,
      prompt: message,
    });

    const cleanedContent = llamaResponse
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    return JSON.parse(cleanedContent) as KnowledgeResult;
  }

  async knowledgeInsert(
    knowledge: { isRelevant: boolean; content: string; confidence_score: number },
    userId: number | undefined
  ) {
    if (!knowledge.isRelevant || !userId) return;

    await supabase.from('knowledge').insert([
      {
        user_id: Number(userId),
        content: knowledge.content,
        confidence_score: knowledge.confidence_score,
      },
    ]);
  }
}
