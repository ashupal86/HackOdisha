'use client'
import React, { useState, useRef, useEffect } from 'react';

interface InputFieldProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  disabled?: boolean;
}

interface Command {
  command: string;
  description: string;
}

export function InputField({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  disabled = false,
}: InputFieldProps) {
  const [showCommands, setShowCommands] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState(0);
  const [selectedCommandCard, setSelectedCommandCard] = useState<Command | null>(null);
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
    
    // Only remove command card if user starts typing a new command (starts with '/')
    if (value.startsWith('/') && selectedCommandCard) {
      setSelectedCommandCard(null);
    }
    
    setShowCommands(value.startsWith('/') && !selectedCommandCard);
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

  // Execute command by showing it as a card
  const executeCommand = (command: Command) => {
    setShowCommands(false);
    setSelectedCommandCard(command);
    // Clear the input field when a command is selected
    const syntheticEvent = {
      target: { value: '' }
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(syntheticEvent);
  };

  // Remove command card
  const removeCommandCard = () => {
    setSelectedCommandCard(null);
  };

  // Modify the submit handler to include command if present
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (selectedCommandCard) {
      // Create a synthetic event with the command and input combined
      const combinedInput = selectedCommandCard.command + (input.trim() ? ' ' + input.trim() : '');
      
      // Create a new form event with the combined input
      const formEvent = {
        ...e,
        target: {
          ...e.target,
          elements: {
            0: { value: combinedInput }
          }
        }
      } as React.FormEvent<HTMLFormElement>;
      
      // Temporarily update the input to include the command
      const syntheticEvent = {
        target: { value: combinedInput }
      } as React.ChangeEvent<HTMLInputElement>;
      handleInputChange(syntheticEvent);
      
      // Submit immediately and clear the command card
      setTimeout(() => {
        handleSubmit(formEvent);
        setSelectedCommandCard(null);
        // Clear the input after submission
        const clearEvent = {
          target: { value: '' }
        } as React.ChangeEvent<HTMLInputElement>;
        handleInputChange(clearEvent);
      }, 0);
    } else {
      handleSubmit(e);
    }
  };

  // Hide commands when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowCommands(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="border-t border-gray-100 bg-white px-6 py-5">
      <form onSubmit={handleFormSubmit} className="relative">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            {/* Selected Command Card */}
            {selectedCommandCard && (
              <div className="mb-3">
                <div className="inline-flex items-center bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg px-3 py-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex-shrink-0">
                      {selectedCommandCard.command === '/dashboard' && (
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      )}
                      {selectedCommandCard.command === '/analytics' && (
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                      {selectedCommandCard.command === '/help' && (
                        <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <span className="font-mono font-medium text-gray-700">
                      {selectedCommandCard.command}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {selectedCommandCard.description}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCommandCard}
                    className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Command Suggestions Dropdown - positioned above input */}
            {showCommands && filteredCommands.length > 0 && !selectedCommandCard && (
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
                          <div className={`font-medium text-sm ${index === selectedCommand ? 'text-blue-700' : 'text-gray-900'
                            }`}>
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

            <input
              ref={inputRef}
              type="text"
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
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
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

        {/* Help text */}
        <div className="mt-3 text-xs text-gray-500 text-center">
          Type your question in natural language, SQL queries, or use commands like <span className="font-mono bg-gray-100 px-1 rounded">/analytics</span> or <span className="font-mono bg-gray-100 px-1 rounded">/dashboard</span>
        </div>
      </form>
    </div>
  );
}