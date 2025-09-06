'use client';

// import { useChat } from 'ai/react';
import {useChat } from '@ai-sdk/react'

import { useEffect, useRef, useState } from 'react';
import { ChatMessage } from './ChatMessage';
import { InputField } from './InputField';
import { InteractiveTool } from './InteractiveTool';
import ChatHeader from './ChatHeader';
import DatabaseMonitoring from './DatabaseMonitoring';

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: '1',
        role: 'assistant',
        content: 'Welcome to AI-SafeQuery! I\'m your intelligent database assistant with built-in governance and compliance features.\n\n🔐 **Safety Features Active:**\n• Role-based access control (RBAC)\n• AI-powered query validation\n• Blockchain audit logging\n• Admin approval workflow\n\nYou can ask me questions in natural language or write SQL queries. I\'ll help you query the database safely while ensuring all operations are logged and compliant.\n\n💡 **Quick Commands:** Type `/` to see available interactive tools like `/dashboard`, `/analytics`, `/logs`, `/status`, and `/help`.',
      },
    ],
  });

  const [interactiveTools, setInteractiveTools] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Mock user data - in real app, this would come from your authentication context
  const currentUser = {
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Database Analyst",
    avatar: "/api/placeholder/100/100",
    joinDate: "Jan 2024",
    lastActive: "2 minutes ago"
  };

  // Mock data - in real app, this would come from your API
  const recentQueries = [
    { id: 1, query: "SELECT * FROM users WHERE status = 'active'", status: "approved", timestamp: "2 hours ago" },
    { id: 2, query: "UPDATE products SET price = 99.99 WHERE id = 123", status: "pending", timestamp: "5 hours ago" },
    { id: 3, query: "SELECT COUNT(*) FROM orders WHERE date > '2024-01-01'", status: "approved", timestamp: "1 day ago" },
  ];

  return (
    <div className="flex h-full bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Left Panel - User Details */}
      <div className="w-110 bg-white border-r border-gray-200 shadow-lg">
        <div className="h-full flex flex-col">
          {/* User Profile Section */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{currentUser.name}</h2>
                <p className="text-sm text-gray-600">{currentUser.role}</p>
                <p className="text-xs text-gray-500">{currentUser.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Joined:</span>
                <p className="font-medium text-gray-900">{currentUser.joinDate}</p>
              </div>
              <div>
                <span className="text-gray-500">Last Active:</span>
                <p className="font-medium text-gray-900">{currentUser.lastActive}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {/* Safety Status */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Safety Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">AI Guardrails</span>
                  <span className="text-green-600 font-medium flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Blockchain Logging</span>
                  <span className="text-green-600 font-medium flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">RBAC Enforcement</span>
                  <span className="text-green-600 font-medium flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Admin Oversight</span>
                  <span className="text-green-600 font-medium flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Tools History */}
            {interactiveTools.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Tools</h3>
                <div className="space-y-2">
                  {interactiveTools.slice(-3).map((tool) => (
                    <div key={tool.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <div className="text-sm font-medium text-gray-700">{tool.command}</div>
                      <div className="text-xs text-gray-500 mt-1">{tool.timestamp.toLocaleTimeString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Queries */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Queries</h3>
              <div className="space-y-3">
                {recentQueries.map((query) => (
                  <div key={query.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="text-xs font-mono text-gray-700 mb-2 line-clamp-2">
                      {query.query}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        query.status === 'approved' ? 'bg-green-100 text-green-800' :
                        query.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {query.status}
                      </span>
                      <span className="text-xs text-gray-500">{query.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-6 border-t border-gray-100">
            <button className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
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
            />
          </div>
        </div>
      </div>

      {/* Right Panel - Database Monitoring */}
      <DatabaseMonitoring />
    </div>
  );
}