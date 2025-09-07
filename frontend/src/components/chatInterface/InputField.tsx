'use client'
import React, { useState, useRef, useEffect } from 'react';

interface InputFieldProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

interface Command {
  command: string;
  description: string;
}

export function InputField({ input, handleInputChange, handleSubmit, isLoading }: InputFieldProps) {
  const [showCommands, setShowCommands] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Available commands for autocomplete
  const commands: Command[] = [
    {
      command: '/dashboard',
      description: 'Generate system dashboard overview with key metrics and status'
    },
    {
      command: '/analytics',
      description: 'Generate comprehensive analytics report with performance metrics and insights'
    },
    {
      command: '/help',
      description: 'Show help information and available commands'
    }
  ];

  // Filter commands based on input - show all when just "/" is typed
  const filteredCommands = input === '/' ? commands : commands.filter(cmd => 
    cmd.command.toLowerCase().includes(input.toLowerCase()) && input.startsWith('/')
  );

  // Handle input changes with command detection
  const handleInputChangeWithCommands = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e);
    const value = e.target.value;
    setShowCommands(value.startsWith('/'));
    setSelectedCommand(0);
  };

  // Handle key navigation for autocomplete
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
      } else if (e.key === 'Tab' || (e.key === 'Enter' && showCommands)) {
        e.preventDefault();
        executeCommand(filteredCommands[selectedCommand]);
      } else if (e.key === 'Escape') {
        setShowCommands(false);
      }
    }
  };

  // Execute command by setting input value
  const executeCommand = (command: Command) => {
    setShowCommands(false);
    // Set the command as input value
    const syntheticEvent = {
      target: { value: command.command }
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(syntheticEvent);
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
                    Quick Commands
                  </div>
                  {filteredCommands.map((command, index) => (
                    <button
                      key={command.command}
                      type="button"
                      onClick={() => executeCommand(command)}
                      className={`w-full text-left px-3 py-3 rounded-lg transition-colors ${
                        index === selectedCommand
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
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          )}
                          {command.command === '/help' && (
                            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm">
                            {command.command}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {command.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Main input field */}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChangeWithCommands}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your database or type / for commands..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-500 transition-all duration-200"
              disabled={isLoading}
            />
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-colors duration-200 flex items-center space-x-2 font-medium"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Send</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Help text */}
        <div className="mt-3 text-xs text-gray-500 text-center">
          Type your question in natural language, SQL queries, or use commands like <span className="font-mono bg-gray-100 px-1 rounded">/analytics</span> or <span className="font-mono bg-gray-100 px-1 rounded">/dashboard</span>
        </div>
      </form>
    </div>
  );
}