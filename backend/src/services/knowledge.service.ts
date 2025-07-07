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

    const { data: existingRows, error } = await supabase
      .from('knowledge')
      .select('content')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching existing knowledge for deduplication:', error);
    }

    const existingContents = (existingRows ?? []).map((row) => row.content).filter(Boolean);

    const dedupPrompt = `You are an assistant that manages a user's long-term profile knowledge base.

      ### EXISTING KNOWLEDGE ###
      """
      ${existingContents.join('\n')}
      """

      ### NEW CANDIDATE KNOWLEDGE ###
      """
      ${knowledge.content}
      """

      ### TASK ###
      Respond in valid JSON ONLY with the following schema:
      {
        "shouldInsert": boolean, // true if the new candidate brings new, meaningful information not already covered above
        "cleanContent": string   // cleaned, concise form of the information to store if shouldInsert is true. Ignore if shouldInsert is false.
      }

      Do not output anything else.`;

    try {
      const llamaResponse = await this.llamaService.promptLlama({
        instructions: instructions.knowledgeCheckInstructions,
        prompt: dedupPrompt,
      });

      const cleaned = llamaResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      const result = JSON.parse(cleaned) as { shouldInsert: boolean; cleanContent: string };

      if (!result.shouldInsert) {
        console.log('Knowledge duplicate detected, skipping insert.');
        return;
      }

      const contentToInsertRaw = result.cleanContent || knowledge.content;
      const contentsArray = contentToInsertRaw
        .split(';')
        .map((c) => c.trim())
        .filter(Boolean);

      if (contentsArray.length === 0) return;

      const rows = contentsArray.map((c) => ({
        user_id: Number(userId),
        content: c,
        confidence_score: knowledge.confidence_score,
      }));

      await supabase.from('knowledge').insert(rows);
    } catch (err) {
      console.error('Error during knowledge deduplication / insertion:', err);
    }
  }
  async getUserKnowledgeContext(userId: number | undefined): Promise<string> {
    if (!userId) return '';

    const { data, error } = await supabase
      .from('knowledge')
      .select('content')
      .eq('user_id', userId);

    if (error || !data) {
      console.error('Error fetching user knowledge:', error);
      return '';
    }

    const joined = data
      .map((k) => k.content)
      .filter(Boolean)
      .join('\n');

    return joined;
  }
}
