// import { OpenAIStream } from 'ai';
// import { StreamingTextResponse } from 'ai/react';
// import OpenAI from 'openai';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export async function POST(req: Request) {
//   const { messages } = await req.json();

//   const response = await openai.chat.completions.create({
//     model: 'gpt-3.5-turbo',
//     stream: true,
//     messages: [
//       {
//         role: 'system',
//         content: `You are an AI assistant for AI-SafeQuery, a database query interface with governance and compliance features. 

// Your role is to:
// 1. Help users write safe SQL queries
// 2. Explain database concepts and query optimization
// 3. Guide users through the approval process for restricted operations
// 4. Provide information about role-based access control
// 5. Help interpret query results

// Key guidelines:
// - Always prioritize safety and proper permissions
// - Suggest SELECT queries over modification queries when possible
// - Explain why certain operations might need admin approval
// - Be helpful but security-conscious
// - If a user asks for potentially dangerous operations (DROP, DELETE, TRUNCATE), explain the risks and approval process

// Remember: All queries go through an AI safety layer and role-based permission checks before execution.`,
//       },
//       ...messages,
//     ],
//     temperature: 0.7,
//   });

//   const stream = OpenAIStream(response);
//   return new StreamingTextResponse(stream);
// }