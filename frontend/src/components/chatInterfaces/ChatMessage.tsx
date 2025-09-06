import { Message } from 'ai/react';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div
        className={`max-w-[75%] rounded-2xl px-5 py-4 shadow-sm ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white ml-8'
            : 'bg-white text-gray-800 mr-8 border border-gray-100 shadow-md'
        }`}
      >
        <div className={`text-xs font-semibold mb-2 ${
          isUser ? 'text-blue-100' : 'text-gray-500'
        }`}>
          {isUser ? 'You' : 'AI Assistant'}
        </div>
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    </div>
  );
}