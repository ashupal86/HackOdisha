import { tool } from 'ai';
import { z } from 'zod';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { executeDbQuery, createProductsTableIfNotExists,getFullDatabaseSchema,getForeignKeys } from '@/dbFunctions/db';

// New tool for fetching database schema
export const fetchDatabaseSchema = tool({
    description: 'Fetch the complete database schema including all tables, columns, and relationships',
    parameters: z.object({}),
    execute: async () => {
        try {
            console.log('Fetching database schema...');

            const [schemaResult, foreignKeysResult] = await Promise.all([
                getFullDatabaseSchema(),
                getForeignKeys()
            ]);

            if (!schemaResult.success) {
                return {
                    success: false,
                    error: schemaResult.error
                };
            }

            console.log(`Fetched schema for ${schemaResult.tableCount} tables.`);
            console.table({
                success: true,
                schema: schemaResult.schema,
                foreignKeys: foreignKeysResult.success ? foreignKeysResult.foreignKeys : [],
                tableCount: schemaResult.tableCount,
                timestamp: new Date().toISOString()
            })
            return {
                success: true,
                schema: schemaResult.schema,
                foreignKeys: foreignKeysResult.success ? foreignKeysResult.foreignKeys : [],
                tableCount: schemaResult.tableCount,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch database schema'
            };
        }
    },
});

// Tool for checking query safety
export const querySafetyCheck = tool({
    description: 'Check if a SQL query is safe to execute',
    parameters: z.object({
        query: z.string().describe('The SQL query to check for safety'),
    }),
    execute: async ({ query }) => {
        console.log("checking safe query.................")
        try {
            // Basic safety checks
            const dangerousOperations = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER'];
            const upperQuery = query.toUpperCase();

            const hasDangerousOps = dangerousOperations.some(op => upperQuery.includes(op));

            if (hasDangerousOps) {
                return {
                    safe: false,
                    reason: 'Query contains potentially dangerous operations that require admin approval',
                    requiresApproval: true
                };
            }

            // Allow UPDATE operations but flag them for review
            if (upperQuery.includes('UPDATE')) {
                return {
                    safe: true,
                    reason: 'UPDATE operation detected - proceed with caution',
                    requiresApproval: false,
                    isUpdate: true
                };
            }

            // Check for INSERT operations
            if (upperQuery.includes('INSERT')) {
                return {
                    safe: true,
                    reason: 'INSERT operation detected - will proceed with validation',
                    requiresApproval: false,
                    isInsert: true
                };
            }

            return {
                safe: true,
                reason: 'Query appears safe for execution',
                requiresApproval: false
            };
        } catch (error) {
            return {
                safe: false,
                reason: 'Error analyzing query safety',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    },
});

// Updated tool for generating safe SQL queries with dynamic schema
export const generateSafeQuery = tool({
    description: 'Convert natural language request into a safe SQL query using the current database schema',
    parameters: z.object({
        request: z.string().describe('Natural language description of what the user wants to do'),
        databaseSchema: z.object({
            schema: z.record(z.any()),
            foreignKeys: z.array(z.object({
                table_name: z.string(),
                constraint_name: z.string(),
                column_name: z.string(),
                foreign_table_name: z.string(),
                foreign_column_name: z.string()
            })),
            tableCount: z.number()
        }).describe('The current database schema with tables, columns, and relationships'),
    }),
    execute: async ({ request, databaseSchema }) => {
        console.log("Generating safe query based on dynamic schema.................")
        try {
            // Format the schema information for the LLM
            const schemaInfo = Object.entries(databaseSchema.schema).map(([tableName, tableInfo]: [string, any]) => {
                const columns = tableInfo.columns.map((col: any) =>
                    `${col.column_name} (${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}${col.is_nullable === 'NO' ? ' NOT NULL' : ''}${col.column_default ? ` DEFAULT ${col.column_default}` : ''})`
                ).join(', ');

                return `Table: ${tableName}\nColumns: ${columns}`;
            }).join('\n\n');

            const foreignKeyInfo = databaseSchema.foreignKeys.length > 0
                ? databaseSchema.foreignKeys.map((fk: any) =>
                    `${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`
                ).join('\n')
                : 'No foreign key relationships';

            const prompt = `Convert this natural language request into a safe SQL query using the provided database schema:

Request: "${request}"

CURRENT DATABASE SCHEMA:
${schemaInfo}

FOREIGN KEY RELATIONSHIPS:
${foreignKeyInfo}

Rules:
- Generate only INSERT, SELECT, or safe UPDATE queries
- Use proper PostgreSQL syntax
- Use ONLY the tables and columns that exist in the schema above
- Match data types exactly as specified in the schema
- For INSERT operations, don't include auto-generated columns (like id with SERIAL)
- If the request mentions a table/column that doesn't exist, suggest the closest match or recommend creating it
- Return only the SQL query, no explanation
- If the request is ambiguous, choose the most logical table based on the schema

Examples based on schema:
- If "products" table exists with columns (name, quantity, price): "insert 30 apples each cost 10" -> "INSERT INTO products (name, quantity, price) VALUES ('apples', 30, 10.00);"
- If "users" table exists: "show all users" -> "SELECT * FROM users ORDER BY id DESC;"

SQL Query:`;

            const response = await generateText({
                model: google('gemini-1.5-flash'),
                prompt,
                maxTokens: 300,
            });

            const sqlQuery = response.text.trim().replace(/```sql|```/g, '');

            // Determine the target table from the query
            const targetTable = sqlQuery.match(/(?:FROM|INTO|UPDATE)\s+(\w+)/i)?.[1]?.toLowerCase();

            return {
                success: true,
                query: sqlQuery,
                originalRequest: request,
                targetTable,
                usedSchema: true,
                availableTables: Object.keys(databaseSchema.schema)
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to generate SQL query',
                originalRequest: request
            };
        }
    },
});

// Tool for executing database operations
export const executeQuery = tool({
    description: 'Execute a validated SQL query on the PostgreSQL database',
    parameters: z.object({
        query: z.string().describe('The SQL query to execute'),
        queryType: z.string().describe('Type of query (INSERT, SELECT, UPDATE, etc.)'),
    }),
    execute: async ({ query, queryType }) => {
        console.log("Executing database query.................")
        try {
            // Ensure products table exists for INSERT operations (fallback for compatibility)
            if (queryType.toUpperCase() === 'INSERT' && query.toLowerCase().includes('products')) {
                await createProductsTableIfNotExists();
            }

            console.log(`Executing ${queryType} query on PostgreSQL:`, query);

            const result = await executeDbQuery(query);

            if (!result.success) {
                return {
                    success: false,
                    error: result.error,
                    query,
                    timestamp: new Date().toISOString()
                };
            }

            if (queryType.toUpperCase() === 'INSERT') {
                return {
                    success: true,
                    result: {
                        insertId: result.rows[0]?.id || 'Generated',
                        affectedRows: result.rowCount || 1,
                        command: result.command
                    },
                    message: `Successfully inserted ${result.rowCount || 1} record(s) into the database.`,
                    query,
                    timestamp: new Date().toISOString()
                };
            } else if (queryType.toUpperCase() === 'SELECT') {
                return {
                    success: true,
                    result: result.rows,
                    message: `Query executed successfully. Retrieved ${result.rowCount || 0} records.`,
                    rowCount: result.rowCount,
                    query,
                    timestamp: new Date().toISOString()
                };
            } else if (queryType.toUpperCase() === 'UPDATE') {
                return {
                    success: true,
                    result: {
                        affectedRows: result.rowCount || 0,
                        command: result.command
                    },
                    message: `Successfully updated ${result.rowCount || 0} record(s) in the database.`,
                    query,
                    timestamp: new Date().toISOString()
                };
            }

            return {
                success: true,
                result: {
                    rowCount: result.rowCount,
                    command: result.command
                },
                message: 'Operation completed successfully',
                query,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Database execution failed',
                query,
                timestamp: new Date().toISOString()
            };
        }
    },
});

// Tool for generating user-friendly responses about database operations
export const generateResponse = tool({
    description: 'Generate a user-friendly response about the database operation result',
    parameters: z.object({
        originalRequest: z.string().describe('The original user request'),
        queryResult: z.object({
            success: z.boolean(),
            result: z.any().optional(),
            message: z.string().optional(),
            error: z.string().optional(),
            rowCount: z.number().optional(),
        }).describe('The result from database execution'),
        sqlQuery: z.string().describe('The SQL query that was executed'),
        schemaInfo: z.object({
            usedSchema: z.boolean().optional(),
            availableTables: z.array(z.string()).optional(),
            targetTable: z.string().optional()
        }).optional().describe('Information about schema usage'),
    }),
    execute: async ({ originalRequest, queryResult, sqlQuery, schemaInfo }) => {
        console.log("Generating user-friendly response.................")
        try {
            const schemaContext = schemaInfo?.usedSchema
                ? `The query was generated using the current database schema with ${schemaInfo.availableTables?.length || 0} available tables.`
                : '';

            const prompt = `Generate a friendly, conversational response to the user about their database operation.

Original request: "${originalRequest}"
SQL query executed: "${sqlQuery}"
Operation result: ${JSON.stringify(queryResult, null, 2)}
Schema context: ${schemaContext}

Guidelines:
- Be conversational and friendly
- Explain what happened in simple terms
- Include relevant details (like number of records affected, data retrieved, etc.)
- If there was an error, explain it clearly and suggest solutions
- Keep it concise but informative
- Don't show the raw SQL unless specifically relevant
- If schema was used, mention that the query was tailored to the database structure

Response:`;

            const response = await generateText({
                model: google('gemini-1.5-flash'),
                prompt,
                maxTokens: 300,
            });

            return {
                success: true,
                response: response.text.trim(),
                originalRequest,
                sqlQuery,
                queryResult,
                usedDynamicSchema: schemaInfo?.usedSchema || false
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to generate response',
                fallbackResponse: queryResult.success
                    ? 'Operation completed successfully!'
                    : 'There was an error with your request. Please try again.'
            };
        }
    },
});