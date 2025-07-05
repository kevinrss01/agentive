import type { Database } from './supabase.types';

/**
 * @note Simplified types
 */
export type User = Database['public']['Tables']['user']['Row'];
export type NewUser = Database['public']['Tables']['user']['Insert'];
export type UpdateUser = Database['public']['Tables']['user']['Update'];

export type Conversation = Database['public']['Tables']['conversation']['Row'];
export type NewConversation = Database['public']['Tables']['conversation']['Insert'];

export type Message = Database['public']['Tables']['conversation_message']['Row'];
export type NewMessage = Database['public']['Tables']['conversation_message']['Insert'];
