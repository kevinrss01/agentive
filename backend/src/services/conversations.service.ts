import { supabase } from '@/config/supabase';
import { UUID } from 'crypto';

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

    const { data: messageData, error: messageError } = await supabase
      .from('conversation_message')
      .insert({
        content: params.content,
        conversation_id: convData.id,
        created_at: new Date().toISOString(),
        role: 'user',
      })
      .select('id')
      .single();

    if (messageError || !messageData) {
      return { id: undefined, error: messageError ?? new Error('Message insertion failed') };
    }

    return { id: convData.id, error: undefined };
  }

  async conversationMessages(conversationUUID: UUID) {
    const { data: conversation, error: convError } = await supabase
      .from('conversation')
      .select('*')
      .eq('uuid', conversationUUID)
      .single();

    if (convError || !conversation) {
      return { data: undefined, error: convError ?? new Error('Conversation not found') };
    }

    const { data: messages, error } = await supabase
      .from('conversation_message')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true });

    return { data: messages, error };
  }

  async conversationInsert(content: string, conversationUUID: UUID, role: string) {
    const { data: conversation, error: convError } = await supabase
      .from('conversation')
      .select('*')
      .eq('uuid', conversationUUID)
      .single();

    if (convError || !conversation) {
      throw new Error('Conversation not found');
    }

    await supabase.from('conversation_message').insert({
      content,
      conversation_id: conversation.id,
      created_at: new Date().toISOString(),
      role,
    });
  }
}
