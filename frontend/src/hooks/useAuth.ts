'use client';

import { displayToast } from '@/utils/sonnerToast';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

export interface User {
  id: number;
  uuid: string;
  email: string;
  first_name: string | null;
  last_name: string;
  avatar_url: string | null;
  country: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  city: string | null;
  postal_code: string | null;
  street: string | null;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('authVerified');

    setAuthState({
      user: null,
      accessToken: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      const user = localStorage.getItem('user');
      const accessToken = localStorage.getItem('accessToken');
      const authVerified = localStorage.getItem('authVerified');

      if (authVerified === 'true' && user) {
        setAuthState((prev) => ({
          user: JSON.parse(user),
          accessToken,
          isLoading: false,
          isAuthenticated: true,
        }));
        return;
      }

      if (user && accessToken) {
        try {
          // Verify the JWT token with the backend
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL_BACKEND}/api/auth/login`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            setAuthState({
              user: data.user,
              accessToken,
              isLoading: false,
              isAuthenticated: true,
            });
            localStorage.setItem('authVerified', 'true');
          } else {
            displayToast.error(
              'An error occurred while logging in, please try again or contact the support team.'
            );
            logout();
          }
        } catch (error) {
          console.error('Error verifying token:', error);
          displayToast.error(
            'An error occurred while logging in, please try again or contact the support team.'
          );
          logout();
        }
      } else {
        if (!user && !accessToken && !authState.isLoading) {
          router.push('/login');
          logout();
        }
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  const login = (user: User, accessToken: string) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('authVerified', 'true');

    setAuthState({
      user,
      accessToken,
      isLoading: false,
      isAuthenticated: true,
    });
  };

  const updateUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    setAuthState((prev) => ({ ...prev, user }));
  };

  return {
    ...authState,
    login,
    logout,
    updateUser,
  };
};
