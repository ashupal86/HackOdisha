import { google } from '@ai-sdk/google';
import { Agent } from '@mastra/core/agent';
import { generateText, tool } from 'ai';
import { z } from 'zod';

// Define tools using the AI SDK structure
const querySafetyCheck = tool({
  description: 'Check if a SQL query is safe and complies with security policies',
  parameters: z.object({
    query: z.string().describe('The SQL query to validate'),
    userRole: z.string().optional().describe('The role of the user executing the query')
  }),
  execute: async ({ query, userRole = 'user' }) => {
    // Basic safety checks
    const dangerousOperations = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE', 'INSERT', 'UPDATE'];
    const upperQuery = query.toUpperCase();
    
    const hasDangerousOp = dangerousOperations.some(op => upperQuery.includes(op));
    
    if (hasDangerousOp && userRole !== 'admin') {
      return {
        safe: false,
        reason: 'Query contains operations that require admin approval',
        recommendation: 'Request admin approval for this operation',
        requiresApproval: true
      };
    }
    
    return {
      safe: true,
      reason: 'Query appears safe for execution',
      requiresApproval: false
    };
  }
});

const generateSafeQuery = tool({
  description: 'Generate a safe SQL query based on user requirements',
  parameters: z.object({
    requirement: z.string().describe('The user requirement or question to convert to SQL'),
    tableContext: z.string().optional().describe('Available tables and schema information')
  }),
  execute: async ({ requirement }) => {
    // This would typically connect to your database schema
    // For now, return a template response
    return {
      query: `-- Safe query template for: ${requirement}\nSELECT * FROM your_table WHERE condition LIMIT 100;`,
      explanation: 'This is a safe SELECT query that limits results and avoids modification operations.',
      safety_notes: 'Query uses SELECT only and includes LIMIT clause for performance.'
    };
  }
});

// System instructions for the AI-SafeQuery assistant
const systemInstructions = `You are an AI assistant for AI-SafeQuery, a database query interface with governance and compliance features.

Your role is to:
1. Help users write safe SQL queries
2. Explain database concepts and query optimization
3. Guide users through the approval process for restricted operations
4. Provide information about role-based access control
5. Help interpret query results
6. Assist with the interactive dashboard and analytics tools

Key guidelines:
- Always prioritize safety and proper permissions
- Suggest SELECT queries over modification queries when possible
- Explain why certain operations might need admin approval
- Be helpful but security-conscious
- If a user asks for potentially dangerous operations (DROP, DELETE, TRUNCATE), explain the risks and approval process
- When users ask about system features, explain the governance, compliance, and blockchain logging capabilities

Remember: All queries go through an AI safety layer and role-based permission checks before execution. This system features:
- Role-based access control (RBAC)
- AI-powered query validation
- Blockchain audit logging
- Admin approval workflows
- Interactive dashboards and analytics

Context: This is a governance and compliance system for database access with blockchain logging and admin approval workflows.`;

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid messages in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return new Response(
        JSON.stringify({ error: 'Last message must be from user' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }


    const agent = new Agent({
      name: 'AI-SafeQuery Assistant',
      instructions:systemInstructions,
      tools:{
        querySafetyCheck,
        generateSafeQuery
      },
      model: google('gemini-1.5-flash'),
    })


    const response = await agent.stream(messages, {
      onFinish:async ({ usage, response: agentResponse }) =>{
        console.table({
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          totalTokens: usage.totalTokens
        });
      },
      onError: (err) => {
        console.error('Agent error:', err);
      }
    })

    return response.toDataStreamResponse()

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get('id');

    if (!chatId) {
      return new Response(
        JSON.stringify({ error: 'Chat ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // For now, return empty messages array
    // In a real implementation, you would fetch from your database
    const messages: Array<{ role: string; content: string }> = [];
    
    return new Response(
      JSON.stringify({ messages }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return new Response(
      JSON.stringify({ error: 'Error fetching chat history' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}