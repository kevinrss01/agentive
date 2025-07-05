import { supabase } from '@/config/supabase';

export class ConversationsService {
  async userConversations(userId: number) {
    const { data, error } = await supabase
      .from('conversation')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  }

  async createConversationWithMessage(params: {
    topic: string;
    user_id: number;
    content: string;
    uuid: string;
  }) {
    const { data: convData, error: convError } = await supabase
      .from('conversation')
      .insert({
        topic: params.topic,
        user_id: params.user_id,
        created_at: new Date().toISOString(),
        uuid: params.uuid,
      })
      .select('id')
      .single();

    if (convError || !convData) {
      return { id: undefined, error: convError ?? new Error('Conversation insertion failed') };
    }

    const conversation_id = convData.id;

    const { error: msgError } = await supabase.from('conversation_message').insert({
      content: params.content,
      conversation_id,
      created_at: new Date().toISOString(),
    });

    return { id: conversation_id, error: msgError };
  }
}
