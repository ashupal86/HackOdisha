'use client';

// import { useChat } from 'ai/react';
import {useChat } from '@ai-sdk/react'

import { useEffect, useRef, useState } from 'react';
import { ChatMessage } from './ChatMessage';
import { InputField } from './InputField';
import { UserProfile } from './UserProfile';
import { InteractiveTool } from './InteractiveTool';

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

  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  // Mock data - in real app, this would come from your API
  const userInfo = {
    name: "John Doe",
    role: "writer",
    status: "approved",
    permissions: ["SELECT", "INSERT", "UPDATE"]
  };

  const recentQueries = [
    { id: 1, query: "SELECT * FROM users WHERE status = 'active'", status: "approved", timestamp: "2 hours ago" },
    { id: 2, query: "UPDATE products SET price = 99.99 WHERE id = 123", status: "pending", timestamp: "5 hours ago" },
    { id: 3, query: "SELECT COUNT(*) FROM orders WHERE date > '2024-01-01'", status: "approved", timestamp: "1 day ago" },
  ];

  return (
    <div className="flex h-full bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-16'} transition-all duration-300 bg-white border-r border-gray-200 shadow-lg`}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-100">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {sidebarOpen && (
            <div className="flex-1 overflow-y-auto p-4">
              {/* User Profile Component */}
              <UserProfile userInfo={userInfo} />

              {/* Safety Status */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Safety Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">AI Guardrails</span>
                    <span className="text-green-600 font-medium">✓ Active</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Blockchain Logging</span>
                    <span className="text-green-600 font-medium">✓ Active</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">RBAC Enforcement</span>
                    <span className="text-green-600 font-medium">✓ Active</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Admin Oversight</span>
                    <span className="text-green-600 font-medium">✓ Active</span>
                  </div>
                </div>
              </div>

              {/* Interactive Tools History */}
              {interactiveTools.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Tools</h3>
                  <div className="space-y-2">
                    {interactiveTools.slice(-3).map((tool) => (
                      <div key={tool.id} className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                        <div className="text-xs font-medium text-gray-700">{tool.command}</div>
                        <div className="text-xs text-gray-500">{tool.timestamp.toLocaleTimeString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Queries */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Queries</h3>
                <div className="space-y-2">
                  {recentQueries.map((query) => (
                    <div key={query.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <div className="text-xs font-mono text-gray-700 mb-2 truncate">
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
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white px-6 py-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">AI-SafeQuery</h1>
                <p className="text-blue-100 text-sm mt-1 font-medium">
                  Secure Database Interface with Governance & Compliance
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">System Active</span>
              </div>
            </div>
          </div>
        </div>

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
    </div>
  );
}