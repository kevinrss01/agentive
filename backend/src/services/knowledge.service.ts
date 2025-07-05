import { supabase } from '@/config/supabase';

export class KnowledgeService {
  knowledgeInsert = async (
    knowledge: { isRevelant: boolean; content: string; confidence_score: number },
    userId: number
  ) => {
    await supabase.from('knowledge').insert([
      {
        user_id: Number(userId),
        content: knowledge.content,
        confidence_score: knowledge.confidence_score,
      },
    ]);
  };
}
