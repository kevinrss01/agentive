import { supabase } from '../config/supabase';
import { UserData } from '../types/auth.types';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';

export class AuthService {
  /**
   * Initiate Google OAuth login
   */
  async initiateGoogleLogin(redirectUrl: string): Promise<{ url: string | null; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google OAuth error:', error);
        return { url: null, error: error.message };
      }

      return { url: data.url };
    } catch (error) {
      console.error('Auth service error:', error);
      return { url: null, error: 'Internal server error' };
    }
  }

  /**
   * Handle OAuth callback and get user data
   */
  async handleCallback(
    accessToken: string
  ): Promise<{ user: UserData | null; token?: string; error?: string }> {
    try {
      const { data: userData, error } = await supabase.auth.getUser(accessToken);

      if (error) {
        console.error('Get user error:', error);
        return { user: null, error: error.message };
      }

      if (!userData.user) {
        return { user: null, error: 'No user data found' };
      }

      // Extract name from metadata safely
      const fullName = (userData.user.user_metadata?.full_name as string) || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || null;
      const lastName = nameParts.slice(1).join(' ') || '';

      // Check if user already exists in database
      const existingUser = await this.getUserByUuid(userData.user.id);

      let user: UserData;
      if (existingUser) {
        // User exists - update with latest info
        user = await this.updateExistingUser(userData.user, firstName, lastName);
      } else {
        // New user - create in database
        user = await this.createNewUser(userData.user, firstName, lastName);
      }

      // Generate JWT token
      const token = jwt.sign({ user }, config.jwt.secret, { expiresIn: '24h' });

      return { user, token };
    } catch (error) {
      console.error('Callback handling error:', error);
      return { user: null, error: 'Internal server error' };
    }
  }

  /**
   * Get existing user by UUID
   */
  private async getUserByUuid(uuid: string): Promise<UserData | null> {
    try {
      const { data, error } = await supabase.from('user').select('*').eq('uuid', uuid).single();

      if (error || !data) {
        return null;
      }

      return data as UserData;
    } catch (error) {
      console.error('Get user by UUID error:', error);
      return null;
    }
  }

  /**
   * Update existing user with latest info
   */
  private async updateExistingUser(
    authUser: { id: string; email?: string; user_metadata?: { avatar_url?: string } },
    firstName: string | null,
    lastName: string
  ): Promise<UserData> {
    try {
      const updateData = {
        email: authUser.email || '',
        first_name: firstName,
        last_name: lastName,
        avatar_url: authUser.user_metadata?.avatar_url || null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('user')
        .update(updateData)
        .eq('uuid', authUser.id)
        .select()
        .single();

      if (error) {
        console.error('Update user error:', error);
        throw error;
      }

      return data as UserData;
    } catch (error) {
      console.error('Update existing user error:', error);
      throw error;
    }
  }

  /**
   * Create new user in database
   */
  private async createNewUser(
    authUser: { id: string; email?: string; user_metadata?: { avatar_url?: string } },
    firstName: string | null,
    lastName: string
  ): Promise<UserData> {
    try {
      // Get the next ID from the sequence
      const { data: idResult, error: idError } = await supabase
        .from('user')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single();

      const nextId = idError || !idResult ? 1 : (idResult.id || 0) + 1;

      const newUser = {
        id: nextId,
        uuid: authUser.id,
        email: authUser.email || '',
        first_name: firstName,
        last_name: lastName,
        avatar_url: authUser.user_metadata?.avatar_url || null,
        country: 'Unknown',
        is_active: true,
        city: null,
        postal_code: null,
        street: null,
      };

      const { data, error } = await supabase
        .from('user')
        .insert(newUser as any)
        .select()
        .single();

      if (error) {
        console.error('Create user error:', error);
        throw error;
      }

      return data as UserData;
    } catch (error) {
      console.error('Create new user error:', error);
      throw error;
    }
  }

  /**
   * Verify JWT token and get user information
   */
  async verifyToken(token: string): Promise<{ user: UserData | null; error?: string }> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { user: UserData };

      // Optionally, you can fetch fresh user data from database
      const { user, error } = await this.getUserById(decoded.user.uuid);

      if (error || !user) {
        return { user: null, error: 'User not found' };
      }

      return { user };
    } catch (error) {
      console.error('Token verification error:', error);
      return { user: null, error: 'Invalid or expired token' };
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<{ user: UserData | null; error?: string }> {
    try {
      const { data, error } = await supabase.from('user').select('*').eq('uuid', userId).single();

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data) {
        return { user: null, error: 'User not found' };
      }

      const user = data as UserData;
      return { user };
    } catch (error) {
      console.error('Get user by ID error:', error);
      return { user: null, error: 'Internal server error' };
    }
  }

  /**
   * Logout user
   */
  async logout(accessToken: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.admin.signOut(accessToken);

      if (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Logout service error:', error);
      return { success: false, error: 'Internal server error' };
    }
  }
}
