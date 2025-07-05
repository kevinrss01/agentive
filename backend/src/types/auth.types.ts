import type { Database } from './supabase.types';

export interface AuthCallbackRequest {
  accessToken: string;
}

export interface AuthResponse {
  url?: string;
  user?: UserData;
  error?: string;
}

// Use the generated user type from Supabase
export type UserData = Database['public']['Tables']['user']['Row'];

export interface LogoutRequest {
  accessToken: string;
}
