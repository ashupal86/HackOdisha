'use client';

import { ChatInterface } from './ChatInterface';

interface ChatContainerProps {
  className?: string;
}

export function ChatContainer({ className = '' }: ChatContainerProps) {
  return (
    <div className={`h-screen w-full bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 ${className}`}>
      <div className="h-full w-full">
        <ChatInterface />
      </div>
    </div>
  );
}