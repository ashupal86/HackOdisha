import React from 'react';

interface InputFieldProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export function InputField({ input, handleInputChange, handleSubmit, isLoading }: InputFieldProps) {
  return (
    <div className="border-t border-gray-100 bg-white px-6 py-5">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask a question or write an SQL query..."
              className="w-full rounded-xl border border-gray-200 px-5 py-4 text-sm bg-gray-50 focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 placeholder-gray-400"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-8 py-4 rounded-xl font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105 disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>Send</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}