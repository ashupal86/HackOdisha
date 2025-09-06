import React from 'react';

interface ChatHeaderProps {
  title?: string;
  isOnline?: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  title = "AI SafeQuery Assistant",
  isOnline = true
}) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
      {/* Left Section - Title and Status */}
      <div className="flex items-center space-x-3">
        {/* Avatar/Icon */}
        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-md">
          <svg 
            className="w-6 h-6 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
            />
          </svg>
        </div>
        
        {/* Title and Status */}
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-gray-900">
            {title}
          </h1>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'} animate-pulse`} />
            <span className="text-sm text-gray-600 font-medium">
              {isOnline ? 'AI Agent Ready' : 'Agent Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Right Section - Compliance Badge */}
      <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="text-sm font-semibold">Governance Layer Active</span>
      </div>
    </div>
  );
};

export default ChatHeader;