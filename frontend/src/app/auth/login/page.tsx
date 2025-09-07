'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { LoginForm } from '@/components/auth';
import axios from 'axios';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (data: { username: string; password: string }) => {
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call
      console.log('Login attempt:', data);
      
      // Show loading toast
      const loadingToast = toast.loading('Signing you in...');
      
      // Simulate API call
        const resp = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {username:data.username, password:data.password})
        console.log("auth resp", resp)

      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // For now, simulate successful login
      // In real implementation, you would:
      // 1. Call your login API endpoint
      // 2. Store the JWT token
      // 3. Redirect to dashboard/chat
      
      // Show success toast
      toast.success('Login successful! Redirecting to chat...', {
        icon: '🎉',
        style: {
          background: '#10B981',
          color: '#fff',
        },
      });
      
      // Delay redirect to show toast
      setTimeout(() => {
        router.push('/chat');
      }, 1000);
      
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials and try again.', {
        icon: '❌',
        style: {
          background: '#EF4444',
          color: '#fff',
        },
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