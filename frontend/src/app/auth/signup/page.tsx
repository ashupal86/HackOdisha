'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { SignupForm } from '@/components/auth';
import axios from 'axios';

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (data: { 
    username: string; 
    email: string; 
    password: string; 
  }) => {
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call
      console.log('Signup attempt:', data);
      
      // Show loading toast
      const loadingToast = toast.loading('Creating your account...');
      
        const resp = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`,{
            "username": data.username,
            "email": data.email,
            "password": data.password
        })

        console.log("auth resp", resp.data)
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // For now, simulate successful signup
      // In real implementation, you would:
      // 1. Call your signup API endpoint
      // 2. Handle account creation
      // 3. Show success message and redirect to login
      
      // Show success toast with multiple notifications
      toast.success('Account created successfully!', {
        icon: '✅',
        style: {
          background: '#10B981',
          color: '#fff',
        },
        duration: 3000,
      });
      
      // Show info toast about admin approval
      setTimeout(() => {
        toast('⏳ Please wait for admin approval. You\'ll receive an email notification once approved.', {
          style: {
            background: '#F59E0B',
            color: '#fff',
          },
          duration: 5000,
        });
      }, 500);
      
      // Delay redirect to show toasts
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
      
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Signup failed. Please try again.', {
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

  const handleSwitchToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <SignupForm
      onSubmit={handleSignup}
      onSwitchToLogin={handleSwitchToLogin}
      isLoading={isLoading}
    />
  );
}