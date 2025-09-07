'use client'
import React, { useState, useRef, useEffect } from 'react';

interface InputFieldProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  onCommandExecuted: (command: string, content: any) => void;
  disabled?: boolean;
}

interface Command {
  command: string;
  description: string;
  action: () => void;
}

export function InputField({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  onCommandExecuted,
  disabled = false,
}: InputFieldProps) {
  const [showCommands, setShowCommands] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate dashboard content
  const generateDashboard = () => {
    return {
      type: 'dashboard',
      content: {
        title: 'AI-SafeQuery Interactive Dashboard',
        metrics: [
          { label: 'Total Queries Today', value: '1,247', change: '+12%', trend: 'up' },
          { label: 'Approval Rate', value: '94.2%', change: '+2.1%', trend: 'up' },
          { label: 'Active Users', value: '89', change: '-3%', trend: 'down' },
          { label: 'Blocked Queries', value: '23', change: '+5%', trend: 'up' }
        ],
        charts: {
          queryTypes: [
            { type: 'SELECT', count: 980, percentage: 78.6 },
            { type: 'INSERT', count: 156, percentage: 12.5 },
            { type: 'UPDATE', count: 89, percentage: 7.1 },
            { type: 'DELETE', count: 22, percentage: 1.8 }
          ],
          timelineData: [
            { time: '00:00', queries: 45 },
            { time: '04:00', queries: 23 },
            { time: '08:00', queries: 178 },
            { time: '12:00', queries: 234 },
            { time: '16:00', queries: 289 },
            { time: '20:00', queries: 167 }
          ]
        },
        recentActivity: [
          { user: 'john.doe', action: 'executed SELECT query', status: 'approved', time: '2 min ago' },
          { user: 'jane.smith', action: 'requested DELETE operation', status: 'pending', time: '5 min ago' },
          { user: 'admin', action: 'approved UPDATE query', status: 'completed', time: '8 min ago' }
        ]
      }
    };
  };

  // Generate analytics content
  const generateAnalytics = () => {
    return {
      type: 'analytics',
      content: {
        title: 'Query Analytics & Performance Report',
        performanceMetrics: [
          { metric: 'Avg Query Time', value: '1.2s', benchmark: '< 2s', status: 'good' },
          { metric: 'Success Rate', value: '96.8%', benchmark: '> 95%', status: 'excellent' },
          { metric: 'Compliance Score', value: '98.1%', benchmark: '> 90%', status: 'excellent' },
          { metric: 'Resource Usage', value: '67%', benchmark: '< 80%', status: 'good' }
        ],
        topQueries: [
          { query: 'SELECT * FROM users WHERE status = "active"', count: 156, avgTime: '0.8s' },
          { query: 'SELECT COUNT(*) FROM orders WHERE date > ?', count: 89, avgTime: '1.1s' },
          { query: 'UPDATE user_profiles SET last_login = NOW()', count: 67, avgTime: '0.9s' }
        ],
        userActivity: [
          { user: 'john.doe', queries: 45, approval_rate: '100%', risk_score: 'low' },
          { user: 'jane.smith', queries: 32, approval_rate: '94%', risk_score: 'medium' },
          { user: 'bob.wilson', queries: 28, approval_rate: '89%', risk_score: 'medium' }
        ],
        securityAlerts: [
          { type: 'Unusual Pattern', description: 'Multiple DELETE queries from user: temp_user', severity: 'high' },
          { type: 'Permission Escalation', description: 'User requested admin-level query', severity: 'medium' }
        ]
      }
    };
  };

  // Available commands - only dashboard and analytics
  const commands: Command[] = [
    {
      command: '/dashboard',
      description: 'Generate interactive dashboard with query insights and system metrics',
      action: () => {
        const dashboardData = generateDashboard();
        onCommandExecuted('/dashboard', dashboardData);
      }
    },
    {
      command: '/analytics',
      description: 'View analytics and reports for query patterns and performance',
      action: () => {
        const analyticsData = generateAnalytics();
        onCommandExecuted('/analytics', analyticsData);
      }
    }
  ];

  // Filter commands based on input - show all when just "/" is typed
  const filteredCommands = input === '/' ? commands : commands.filter(cmd =>
    cmd.command.toLowerCase().includes(input.toLowerCase()) && input.startsWith('/')
  );

  // Handle input changes
  const handleInputChangeWithCommands = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e);
    const value = e.target.value;
    setShowCommands(value.startsWith('/'));
    setSelectedCommand(0);
  };

  // Handle key navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showCommands && filteredCommands.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCommand(prev =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCommand(prev =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        executeCommand(filteredCommands[selectedCommand]);
      } else if (e.key === 'Escape') {
        setShowCommands(false);
      }
    }
  };

  // Execute command
  const executeCommand = (command: Command) => {
    setShowCommands(false);
    // Clear input
    const syntheticEvent = {
      target: { value: '' }
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(syntheticEvent);
    // Execute command action
    command.action();
  };

  // Hide commands when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowCommands(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="border-t border-gray-100 bg-white px-6 py-5">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            {/* Command Suggestions Dropdown - positioned above input */}
            {showCommands && filteredCommands.length > 0 && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2 px-3 py-1">
                    Interactive Tools
                  </div>
                  {filteredCommands.map((command, index) => (
                    <button
                      key={command.command}
                      type="button"
                      onClick={() => executeCommand(command)}
                      className={`w-full text-left px-3 py-3 rounded-lg transition-colors ${index === selectedCommand
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {command.command === '/dashboard' && (
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          )}
                          {command.command === '/analytics' && (
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-sm ${index === selectedCommand ? 'text-blue-700' : 'text-gray-900'
                            }`}>
                            {command.command}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {command.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="border-t border-gray-100 px-3 py-2 bg-gray-50 text-xs text-gray-500 rounded-b-xl">
                  Use ↑↓ to navigate, Enter to select, Esc to close
                </div>
              </div>
            )}

            <input
              ref={inputRef}
              value={input}
              onChange={handleInputChangeWithCommands}
              onKeyDown={handleKeyDown}
              placeholder={
                disabled
                  ? "Your account is not approved. Queries are disabled."
                  : "Ask a question, write SQL, or use commands like /dashboard, /analytics..."
              }
              className={`w-full rounded-xl border border-gray-200 px-5 py-4 text-sm text-gray-900 
    ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-gray-50 focus:bg-white"} 
    focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 
    transition-all duration-200 placeholder-gray-400`}
              disabled={isLoading || disabled}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !input.trim() || disabled}
            className={`px-8 py-4 rounded-xl font-medium text-sm transition-all duration-200 shadow-md 
    ${disabled
                ? "bg-gray-300 text-gray-600 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:shadow-lg transform hover:scale-105"}
  `}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>{disabled ? "Restricted" : "Send"}</span>
                {!disabled && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}