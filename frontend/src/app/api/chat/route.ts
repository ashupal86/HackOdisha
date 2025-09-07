import { google } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import {
  generateSafeQuery,
  querySafetyCheck,
  executeQuery,
  generateResponse,
  fetchDatabaseSchema,
  generateAnalyticsReport,
  displayAnalytics,
} from "./tools/index";

interface DecodedUser {
  id: string;
  username: string;
  email: string;
  is_approved: boolean;
  is_active: boolean;
  is_blocked: boolean;
  account_status: string;
}

// System instructions for the AI-SafeQuery assistant
const systemInstructions = `You are an AI assistant for AI-SafeQuery, a database query interface with governance and compliance features.

Your role is to:
1. Help users write safe SQL queries
2. Explain database concepts and query optimization
3. Guide users through the approval process for restricted operations
4. Provide information about role-based access control
5. Help interpret query results
6. Assist with the interactive dashboard and analytics tools
7. Handle system commands like /analytics and /dashboard

Key guidelines:
- Always prioritize safety and proper permissions
- Suggest SELECT queries over modification queries when possible
- Explain why certain operations might need admin approval
- Be helpful but security-conscious
- If a user asks for potentially dangerous operations (DROP, DELETE, TRUNCATE), explain the risks and approval process
- When users ask about system features, explain the governance, compliance, and blockchain logging capabilities

Analytics Command Handling:
- When users type /analytics [table_name] or ask for analysis of a specific table:
  1. First use generateAnalyticsReport to fetch actual data from the specified table
  2. Then use displayAnalytics to format the results in markdown tables
  3. Present comprehensive analysis including data statistics, column analysis, and insights
- Example: "/analytics products" should analyze the products table with real data
- If no table name is provided, ask the user to specify which table they want to analyze

Remember: All queries go through an AI safety layer and role-based permission checks before execution. This system features:
- Role-based access control (RBAC)
- AI-powered query validation
- Blockchain audit logging
- Admin approval workflows
- Interactive dashboards and analytics

Always use the available tools to assist with database operations and system reporting.

Context: You have access to the following tools:
- fetchDatabaseSchema: Fetches the current database schema
- querySafetyCheck: Checks if a SQL query is safe to run
- generateSafeQuery: Generates a safe SQL query based on user intent
- executeQuery: Executes a SQL query against the database
- generateResponse: Generates a user-friendly response based on query results
- generateAnalyticsReport: Generates comprehensive analytics by fetching actual data from a specified table
- displayAnalytics: Formats analytics data into beautiful markdown tables and reports

Context: This is a governance and compliance system for database access with blockchain logging and admin approval workflows.`;

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Extract user from request headers
function getUserFromRequest(req: Request): DecodedUser | null {
  const userHeader = req.headers.get("x-user-data");
  if (!userHeader) return null;

  try {
    return JSON.parse(userHeader) as DecodedUser;
  } catch (err) {
    console.error("Invalid user data header:", err);
    return null;
  }
}

// --- POST /api/chat ---
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const user = getUserFromRequest(req);

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    if (!user.is_approved || user.account_status !== "active" || user.is_blocked) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });
    }

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid messages in request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return new Response(JSON.stringify({ error: "Last message must be from user" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const agent = new Agent({
      name: "AI-SafeQuery Assistant",
      instructions: systemInstructions,
      tools: {
        fetchDatabaseSchema,
        querySafetyCheck,
        generateSafeQuery,
        executeQuery,
        generateResponse,
        generateAnalyticsReport,
        displayAnalytics,
      },
      model: google("gemini-2.5-pro"),
    });

    const response = await agent.stream(messages, {
      onFinish: async ({ usage }) => {
        console.table({
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          totalTokens: usage.totalTokens,
        });
      },
      onError: (err) => {
        console.error("Agent error:", err);
      },
    });

    return response.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// --- GET /api/chat?id=xxx ---
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("id");

    if (!chatId) {
      return new Response(JSON.stringify({ error: "Chat ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // TODO: Fetch chat history from DB. For now, return empty.
    const messages: Array<{ role: string; content: string }> = [];

    return new Response(JSON.stringify({ messages }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return new Response(
      JSON.stringify({ error: "Error fetching chat history" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
