'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { 
  BarChart3, 
  Database, 
  TrendingUp, 
  FileText, 
  Calendar,
  Info,
  Table,
  PieChart,
  Activity
} from 'lucide-react';

interface AnalyticsRendererProps {
  content: string;
  tableName?: string;
  recordCount?: number;
  columnCount?: number;
  timestamp?: string;
}

export function AnalyticsRenderer({ 
  content, 
  tableName, 
  recordCount, 
  columnCount, 
  timestamp 
}: AnalyticsRendererProps) {
  return (
    <div className="w-full max-w-none bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-xl shadow-lg overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="h-6 w-6" />
          <h2 className="text-xl font-bold">Analytics Report</h2>
          {tableName && (
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
              {tableName}
            </span>
          )}
        </div>
        
        {/* Quick Stats */}
        <div className="flex flex-wrap gap-4 mt-4">
          {recordCount !== undefined && (
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="text-sm opacity-90">
                {recordCount.toLocaleString()} records
              </span>
            </div>
          )}
          {columnCount !== undefined && (
            <div className="flex items-center gap-2">
              <Table className="h-4 w-4" />
              <span className="text-sm opacity-90">
                {columnCount} columns
              </span>
            </div>
          )}
          {timestamp && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm opacity-90">
                {new Date(timestamp).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="prose prose-slate max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              // Custom styling for headings
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                  {children}
                </h1>
              ),
              h2: ({ children }) => {
                const text = children?.toString() || '';
                let icon = <Info className="h-5 w-5" />;
                
                if (text.includes('Summary')) {
                  icon = <FileText className="h-5 w-5 text-green-600" />;
                } else if (text.includes('Column Analysis')) {
                  icon = <Table className="h-5 w-5 text-blue-600" />;
                } else if (text.includes('Statistics')) {
                  icon = <TrendingUp className="h-5 w-5 text-purple-600" />;
                } else if (text.includes('Top Values')) {
                  icon = <PieChart className="h-5 w-5 text-orange-600" />;
                } else if (text.includes('Data Sample')) {
                  icon = <Activity className="h-5 w-5 text-indigo-600" />;
                } else if (text.includes('Insights')) {
                  icon = <Info className="h-5 w-5 text-emerald-600" />;
                }
                
                return (
                  <h2 className="text-xl font-semibold text-slate-700 mt-8 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
                    {icon}
                    {children}
                  </h2>
                );
              },
              h3: ({ children }) => (
                <h3 className="text-lg font-medium text-slate-600 mt-6 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  {children}
                </h3>
              ),
              // Enhanced table styling
              table: ({ children }) => (
                <div className="overflow-x-auto my-6 rounded-lg border border-slate-200 shadow-sm">
                  <table className="min-w-full divide-y divide-slate-200 bg-white">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                  {children}
                </thead>
              ),
              th: ({ children }) => (
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  {children}
                </th>
              ),
              tbody: ({ children }) => (
                <tbody className="bg-white divide-y divide-slate-100">
                  {children}
                </tbody>
              ),
              tr: ({ children }) => (
                <tr className="hover:bg-slate-50 transition-colors duration-150">
                  {children}
                </tr>
              ),
              td: ({ children }) => (
                <td className="px-6 py-4 text-sm text-slate-700 border-b border-slate-100">
                  {children}
                </td>
              ),
              // Enhanced paragraph and list styling
              p: ({ children }) => (
                <p className="text-slate-600 leading-relaxed mb-4">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-none space-y-2 mb-4">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="space-y-2 mb-4">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="flex items-start gap-2 text-slate-600">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{children}</span>
                </li>
              ),
              // Code and inline elements
              code: ({ children, className }) => {
                const isInline = !className;
                return isInline ? (
                  <code className="px-2 py-1 bg-slate-100 text-slate-800 rounded text-sm font-mono">
                    {children}
                  </code>
                ) : (
                  <code className={className}>
                    {children}
                  </code>
                );
              },
              // Horizontal rule
              hr: () => (
                <hr className="my-8 border-t-2 border-slate-200" />
              ),
              // Strong/bold text
              strong: ({ children }) => (
                <strong className="font-semibold text-slate-800">
                  {children}
                </strong>
              ),
              // Emphasis/italic text
              em: ({ children }) => (
                <em className="italic text-slate-600">
                  {children}
                </em>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>Analytics powered by AI-SafeQuery</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Report generated at {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}