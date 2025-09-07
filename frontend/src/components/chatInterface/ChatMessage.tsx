import { Message } from 'ai/react';
import { AnalyticsRenderer } from './AnalyticsRenderer';

interface ChatMessageProps {
  message: Message;
}

// Function to detect if content is an analytics report
function isAnalyticsContent(content: string): boolean {
  return content.includes('# 📊 Analytics Report:') || 
         content.includes('## 📋 Summary') ||
         content.includes('## 🔍 Column Analysis') ||
         (content.includes('Analytics Report') && content.includes('|'));
}

// Function to extract metadata from analytics content
function extractAnalyticsMetadata(content: string) {
  const tableNameMatch = content.match(/# 📊 Analytics Report: (.+)/);
  const recordCountMatch = content.match(/\*\*Total Records\*\* \| ([0-9,]+)/);
  const columnCountMatch = content.match(/\*\*Columns\*\* \| (\d+)/);
  const timestampMatch = content.match(/\*Report generated on (.+)\*/);

  return {
    tableName: tableNameMatch?.[1],
    recordCount: recordCountMatch?.[1] ? parseInt(recordCountMatch[1].replace(/,/g, '')) : undefined,
    columnCount: columnCountMatch?.[1] ? parseInt(columnCountMatch[1]) : undefined,
    timestamp: timestampMatch?.[1] ? new Date(timestampMatch[1]).toISOString() : undefined,
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isAnalytics = !isUser && isAnalyticsContent(message.content);

  if (isAnalytics) {
    const metadata = extractAnalyticsMetadata(message.content);
    
    return (
      <div className="flex justify-start mb-6">
        <div className="max-w-[90%] w-full mr-8">
          <div className="text-xs font-semibold mb-2 text-gray-500 ml-1">
            AI Assistant
          </div>
          <AnalyticsRenderer
            content={message.content}
            tableName={metadata.tableName}
            recordCount={metadata.recordCount}
            columnCount={metadata.columnCount}
            timestamp={metadata.timestamp}
          />
        </div>
      </div>
    );
  }

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