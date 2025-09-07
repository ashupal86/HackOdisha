'use client';

// import { useChat } from 'ai/react';
import { useChat } from '@ai-sdk/react'

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChatMessage } from './ChatMessage';
import { InputField } from './InputField';
import { InteractiveTool } from './InteractiveTool';
import ChatHeader from './ChatHeader';
import DatabaseMonitoring from './DatabaseMonitoring';
import { UserProfile } from './UserProfile';
import { AuthManager, type UserData } from '@/utils/auth';
import toast from 'react-hot-toast';

export function ChatInterface() {
  // Inside ChatInterface
  const { messages, input, handleInputChange, handleSubmit: baseHandleSubmit, isLoading } = useChat({
    api: '/api/chat',
    headers: {
      ...AuthManager.getAuthHeader(),
      "x-user-data": JSON.stringify(AuthManager.getUserData()),
    },
    initialMessages: [
      {
        id: '1',
        role: 'assistant',
        content:
          "Welcome to AI-SafeQuery! I'm your intelligent database assistant...",
      },
    ],
  });


  // Wrapper for handleSubmit
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentUser?.is_approved || currentUser.account_status !== 'active') {
      toast.error('Your account is not approved by admin. Queries are disabled.');
      return;
    }

    await baseHandleSubmit(event);
  };


  console.log("CUrrent loggin user", AuthManager.getUserData());

  const [interactiveTools, setInteractiveTools] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Check authentication and load user data on component mount
  useEffect(() => {
    const userData = AuthManager.getUserData();

    if (!userData || !AuthManager.isAuthenticated()) {
      toast.error('Please log in to access the chat interface.');

      router.push('/auth/login');
      return;
    }

    setCurrentUser(userData);

    // Show welcome message based on user status
    if (userData.account_status === 'pending_approval') {
      toast('Your account is pending approval. Limited functionality available.', {
        icon: '⏳',
        style: {
          background: '#F59E0B',
          color: '#fff',
        },
        duration: 4000,
      });
    }
  }, [router]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, interactiveTools]);

  // Handle command execution
  const handleCommandExecuted = (command: string, content: any) => {
    const newTool = {
      id: `tool-${Date.now()}`,
      command,
      data: content,
      timestamp: new Date()
    };
    setInteractiveTools(prev => [...prev, newTool]);
  };

  // Handle logout
  const handleLogout = () => {
    AuthManager.clearAuth();
    toast.success('Logged out successfully');
    router.push('/auth/login');
  };


  // Show loading state while checking authentication
  if (!currentUser) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat interface...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Left Panel - User Details */}
      <div className="w-110 bg-white border-r border-gray-200 shadow-lg">
        <UserProfile currentUser={currentUser} onLogout={handleLogout} />
      </div>

      {/* Center Panel - Chat Window */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <ChatHeader />

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Interactive Tools */}
            {interactiveTools.map((tool) => (
              <InteractiveTool key={tool.id} data={tool.data} />
            ))}

            {/* Chat Messages */}
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {isLoading && (
              <div className="flex justify-start mb-6">
                <div className="bg-white text-gray-800 mr-8 border border-gray-100 shadow-md max-w-[75%] rounded-2xl px-5 py-4">
                  <div className="text-xs font-semibold mb-2 text-gray-500">AI Assistant</div>
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">Processing with AI safety checks...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Field */}
        <div className="border-t border-gray-100">
          <div className="max-w-4xl mx-auto">
            <InputField
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              onCommandExecuted={handleCommandExecuted}
              disabled={!currentUser?.is_approved || currentUser.account_status !== 'active'} // 🔐 Restriction
            />
          </div>
        </div>
      </div>

      {/* Right Panel - Database Monitoring */}
      <DatabaseMonitoring />
    </div>
  );
}