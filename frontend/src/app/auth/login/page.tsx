'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { LoginForm } from '@/components/auth';
import axios, { AxiosError } from 'axios';
import { AuthManager, type AuthSession } from '@/utils/auth';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (data: { username: string; password: string }) => {
    setIsLoading(true);

    try {
      console.log('Login attempt:', data);

      // Show loading toast
      const loadingToast = toast.loading('Signing you in...');

      const resp = await axios.post<AuthSession>(
        `${process.env.NEXT_PUBLIC_API_URL as string}/auth/login`,
        {
          username: data.username,
          password: data.password,
        }
      );

      console.log('First backend token:', resp.data.user.id);

      // After login, call log API
      const logResp = await axios.post<{ access_token: string }>(
        `${process.env.NEXT_PUBLIC_LOG_API_URL as string}/login`,
        { user_id: resp.data.user.id }
      );

      const logToken = logResp.data.access_token;
      console.log('Second backend token:', logToken);

      // Store log token
      AuthManager.setLogToken(logToken);

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Store authentication data in session
      const authSession: AuthSession = resp.data;
      AuthManager.setAuthSession(authSession);

      // Show appropriate success message based on user status
      const userStatus = authSession.user.account_status;
      const isApproved = authSession.user.is_approved;

      if (userStatus === 'pending_approval' || !isApproved) {
        toast.success('Login successful! Note: Account pending approval.', {
          icon: '⏳',
          style: { background: '#F59E0B', color: '#fff' },
          duration: 4000,
        });
      } else if (userStatus === 'blocked') {
        toast.error('Account is blocked. Please contact support.', {
          icon: '🚫',
          style: { background: '#EF4444', color: '#fff' },
        });
        // Don't redirect if blocked
        return;
      } else {
        toast.success('Login successful! Redirecting to chat...', {
          icon: '🎉',
          style: { background: '#10B981', color: '#fff' },
        });
      }

      // Show user message if available
      if (authSession.user.message) {
        setTimeout(() => {
          toast(authSession.user.message as string, {
            style: { background: '#3B82F6', color: '#fff' },
            duration: 3000,
          });
        }, 1000);
      }

      // Delay redirect to show toast
      setTimeout(() => {
        router.push('/chat');
      }, 1500);
    } catch (err: unknown) {
      console.error('Login error:', err);

      let errorMessage =
        'Login failed. Please check your credentials and try again.';

      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError<{ detail?: string }>;
        if (axiosErr.response?.status === 401) {
          errorMessage = 'Invalid username or password.';
        } else if (axiosErr.response?.status === 403) {
          errorMessage = axiosErr.response.data?.detail || 'Account access denied.';
        } else if (axiosErr.response?.data?.detail) {
          errorMessage = axiosErr.response.data.detail;
        }
      }

      toast.error(errorMessage, {
        icon: '❌',
        style: { background: '#EF4444', color: '#fff' },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToSignup = () => {
    router.push('/auth/signup');
  };

  return (
    <LoginForm
      onSubmit={handleLogin}
      onSwitchToSignup={handleSwitchToSignup}
      isLoading={isLoading}
    />
  );
}
