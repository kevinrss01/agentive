'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@heroui/react';

const CallbackPage = () => {
  const [status, setStatus] = useState('processing');
  const [hasProcessed, setHasProcessed] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleCallback = useCallback(async () => {
    if (hasProcessed) return; // Prevent multiple calls

    try {
      setHasProcessed(true);

      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');

      if (!accessToken) {
        console.error('No access token found in URL');
        setStatus('error');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL_BACKEND}/api/auth/callback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ accessToken }),
        }
      );

      if (!response.ok) {
        console.error('Backend callback failed:', response.statusText);
        setStatus('error');
        return;
      }

      const data = await response.json();

      // Use the auth hook to login with the JWT token from backend
      if (data.user && data.accessToken) {
        login(data.user, data.accessToken);
      }

      setStatus('success');

      // Redirect to app after successful authentication
      setTimeout(() => {
        router.push('/app');
      }, 1000);
    } catch (error) {
      console.error('Callback error:', error);
      setStatus('error');
    }
  }, [hasProcessed, login, router]);

  useEffect(() => {
    handleCallback();
  }, [handleCallback]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {status === 'processing' && (
        <>
          <div style={{ marginBottom: '20px' }}>🔄</div>
          <p>Processing authentication...</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div style={{ marginBottom: '20px' }}>✅</div>
          <p>Authentication successful! Redirecting...</p>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={{ marginBottom: '20px' }}>❌</div>
          <p className="pb-5">Authentication failed</p>
          <Button color="primary" onPress={() => router.push('/login')}>
            Back to Login
          </Button>
        </>
      )}
    </div>
  );
};

export default CallbackPage;
