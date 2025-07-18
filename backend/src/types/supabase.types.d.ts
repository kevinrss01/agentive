export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      conversation: {
        Row: {
          created_at: string;
          id: number;
          topic: string | null;
          user_id: number;
          uuid: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          topic?: string | null;
          user_id: number;
          uuid: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          topic?: string | null;
          user_id?: number;
          uuid?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'conversation_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['id'];
          },
        ];
      };
      conversation_message: {
        Row: {
          content: string;
          conversation_id: number;
          created_at: string;
          id: number;
          isAskingForMoreInformation: boolean | null;
          role: string;
        };
        Insert: {
          content: string;
          conversation_id: number;
          created_at?: string;
          id?: number;
          isAskingForMoreInformation?: boolean | null;
          role?: string;
        };
        Update: {
          content?: string;
          conversation_id?: number;
          created_at?: string;
          id?: number;
          isAskingForMoreInformation?: boolean | null;
          role?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'conversation_message_conversation_id_fkey';
            columns: ['conversation_id'];
            isOneToOne: false;
            referencedRelation: 'conversation';
            referencedColumns: ['id'];
          },
        ];
      };
      conversation_message_screenshots: {
        Row: {
          id: number;
          conversation_message_id: number;
          original_url: string;
          screenshot_url: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          conversation_message_id: number;
          original_url: string;
          screenshot_url: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          conversation_message_id?: number;
          original_url?: string;
          screenshot_url?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'conversation_message_screenshots_conversation_message_id_fkey';
            columns: ['conversation_message_id'];
            isOneToOne: false;
            referencedRelation: 'conversation_message';
            referencedColumns: ['id'];
          },
        ];
      };
      knowledge: {
        Row: {
          confidence_score: number | null;
          content: string;
          created_at: string;
          id: number;
          user_id: number | null;
        };
        Insert: {
          confidence_score?: number | null;
          content: string;
          created_at?: string;
          id?: number;
          user_id?: number | null;
        };
        Update: {
          confidence_score?: number | null;
          content?: string;
          created_at?: string;
          id?: number;
          user_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'knowledge_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['id'];
          },
        ];
      };
      user: {
        Row: {
          avatar_url: string | null;
          city: string | null;
          country: string;
          created_at: string;
          email: string;
          first_name: string | null;
          id: number;
          is_active: boolean;
          last_name: string;
          postal_code: string | null;
          street: string | null;
          updated_at: string;
          uuid: string;
        };
        Insert: {
          avatar_url?: string | null;
          city?: string | null;
          country: string;
          created_at?: string;
          email: string;
          first_name?: string | null;
          id: number;
          is_active: boolean;
          last_name: string;
          postal_code?: string | null;
          street?: string | null;
          updated_at?: string;
          uuid?: string;
        };
        Update: {
          avatar_url?: string | null;
          city?: string | null;
          country?: string;
          created_at?: string;
          email?: string;
          first_name?: string | null;
          id?: number;
          is_active?: boolean;
          last_name?: string;
          postal_code?: string | null;
          street?: string | null;
          updated_at?: string;
          uuid?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
