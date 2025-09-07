import { tool } from 'ai';
import { z } from 'zod';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { executeDbQuery, getFullDatabaseSchema, getForeignKeys, checkTableExists } from '@/dbFunctions/db';

// Type definitions for better type safety
interface ColumnAnalysis {
    dataType: string;
    nonNullCount: number;
    nullCount: number;
    nullPercentage: string;
    min?: number;
    max?: number;
    average?: number;
    median?: number;
    sum?: number;
    uniqueCount?: number;
    topValues?: Array<{ value: string; count: number }>;
}

interface Analysis {
    summary: {
        tableName: string;
        totalRecords: number;
        columnsCount: number;
        columns: string[];
        sampleSize: number;
        analysisType: string;
    };
    columnAnalysis: Record<string, ColumnAnalysis>;
    insights: string[];
}

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
                foreignKeys: foreignKeysResult.success ? foreignKeysResult.data : [],
                tableCount: schemaResult.tableCount,
                timestamp: new Date().toISOString()
            })
            return {
                success: true,
                schema: schemaResult.schema,
                foreignKeys: foreignKeysResult.success ? foreignKeysResult.data : [],
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
                column_name: z.string(),
                foreign_table_name: z.string(),
                foreign_column_name: z.string()
            })),
            tableCount: z.number()
        }).optional().describe('The current database schema with tables, columns, and relationships. If not provided, will be fetched automatically.'),
    }),
    execute: async ({ request, databaseSchema }) => {
        console.log("Generating safe query based on dynamic schema.................")
        try {
            let schemaToUse = databaseSchema;

            // If no schema provided or schema is empty, fetch it automatically
            if (!schemaToUse || !schemaToUse.schema || Object.keys(schemaToUse.schema).length === 0) {
                console.log("No schema provided, fetching database schema automatically...");
                
                const [schemaResult, foreignKeysResult] = await Promise.all([
                    getFullDatabaseSchema(),
                    getForeignKeys()
                ]);

                if (!schemaResult.success) {
                    return {
                        success: false,
                        error: `Failed to fetch database schema: ${schemaResult.error}`,
                        originalRequest: request
                    };
                }

                schemaToUse = {
                    schema: schemaResult.schema || {},
                    foreignKeys: foreignKeysResult.success ? foreignKeysResult.data || [] : [],
                    tableCount: schemaResult.tableCount || 0
                };

                console.log(`Auto-fetched schema for ${schemaToUse.tableCount} tables`);
            }

            // Validate that we now have a proper schema
            if (!schemaToUse.schema || Object.keys(schemaToUse.schema).length === 0) {
                return {
                    success: false,
                    error: 'No tables found in the database schema. Please ensure the database has tables.',
                    originalRequest: request
                };
            }

            // Format the schema information for the LLM
            const schemaInfo = Object.entries(schemaToUse.schema).map(([tableName, tableInfo]) => {
                const typedTableInfo = tableInfo as { columns: Array<{ column_name: string; data_type: string; character_maximum_length?: number; is_nullable: string; column_default?: string }> };
                const columns = typedTableInfo.columns.map((col) =>
                    `${col.column_name} (${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}${col.is_nullable === 'NO' ? ' NOT NULL' : ''}${col.column_default ? ` DEFAULT ${col.column_default}` : ''})`
                ).join(', ');

                return `Table: ${tableName}\nColumns: ${columns}`;
            }).join('\n\n');

            const foreignKeyInfo = schemaToUse.foreignKeys && schemaToUse.foreignKeys.length > 0
                ? schemaToUse.foreignKeys.map((fk) =>
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
                availableTables: Object.keys(schemaToUse.schema),
                autoFetchedSchema: !databaseSchema || !databaseSchema.schema || Object.keys(databaseSchema.schema).length === 0
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
        targetTable: z.string().optional().describe('The target table for the operation'),
    }),
    execute: async ({ query, queryType, targetTable }) => {
        console.log("Executing database query.................")
        try {
            // Check if target table exists for INSERT/UPDATE operations
            if (targetTable && (queryType.toUpperCase() === 'INSERT' || queryType.toUpperCase() === 'UPDATE')) {
                const tableExists = await checkTableExists(targetTable);
                if (!tableExists) {
                    return {
                        success: false,
                        error: `Table '${targetTable}' does not exist. Please check available tables or create the table first.`,
                        query,
                        timestamp: new Date().toISOString(),
                        suggestion: "Use the schema tool to see available tables in the database."
                    };
                }
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
                        insertId: result.data?.rows[0]?.id || 'Generated',
                        affectedRows: result.data?.rowCount || 1,
                        command: result.data?.command
                    },
                    message: `Successfully inserted ${result.data?.rowCount || 1} record(s) into the database.`,
                    query,
                    timestamp: new Date().toISOString()
                };
            } else if (queryType.toUpperCase() === 'SELECT') {
                return {
                    success: true,
                    result: result.data?.rows,
                    message: `Query executed successfully. Retrieved ${result.data?.rowCount || 0} records.`,
                    rowCount: result.data?.rowCount,
                    query,
                    timestamp: new Date().toISOString()
                };
            } else if (queryType.toUpperCase() === 'UPDATE') {
                return {
                    success: true,
                    result: {
                        affectedRows: result.data?.rowCount || 0,
                        command: result.data?.command
                    },
                    message: `Successfully updated ${result.data?.rowCount || 0} record(s) in the database.`,
                    query,
                    timestamp: new Date().toISOString()
                };
            }

            return {
                success: true,
                result: {
                    rowCount: result.data?.rowCount,
                    command: result.data?.command
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

// Tool for generating analytics report
export const generateAnalyticsReport = tool({
    description: 'Generate comprehensive analytics report by fetching actual data from specified database table',
    parameters: z.object({
        tableName: z.string().describe('Name of the table to analyze'),
        analysisType: z.string().optional().describe('Type of analysis: summary, detailed, trends, etc.')
    }),
    execute: async ({ tableName, analysisType = 'detailed' }) => {
        try {
            console.log(`Generating analytics report for table: ${tableName}...`);
            
            // Fetch table data
            const dataQuery = `SELECT * FROM ${tableName} LIMIT 1000`;
            const dataResult = await executeDbQuery(dataQuery);
            
            if (!dataResult.success) {
                return {
                    success: false,
                    error: `Failed to fetch data from table '${tableName}': ${dataResult.error}`
                };
            }

            const data = dataResult.data?.rows;
            const totalRecords = data?.length || 0;

            if (totalRecords === 0) {
                return {
                    success: true,
                    tableName,
                    analysis: {
                        summary: {
                            totalRecords: 0,
                            message: 'No data found in the table'
                        }
                    },
                    timestamp: new Date().toISOString()
                };
            }

            if (!data) {
                return {
                    success: false,
                    error: 'No data returned from query'
                };
            }

            // Get table count (more accurate than LIMIT)
            const countQuery = `SELECT COUNT(*) as total FROM ${tableName}`;
            const countResult = await executeDbQuery(countQuery);
            const actualTotal = countResult.success && countResult.data?.rows[0] 
                ? parseInt(String(countResult.data.rows[0].total))
                : totalRecords;

            // Get column information
            const columns = Object.keys(data[0]);
            
            // Generate basic statistics
            const analysis: Analysis = {
                summary: {
                    tableName,
                    totalRecords: actualTotal,
                    columnsCount: columns.length,
                    columns: columns,
                    sampleSize: totalRecords,
                    analysisType
                },
                columnAnalysis: {},
                insights: []
            };

            // Analyze each column
            for (const column of columns) {
                const columnData = data.map(row => row[column]).filter(val => val !== null && val !== undefined);
                const nonNullCount = columnData.length;
                const nullCount = totalRecords - nonNullCount;
                
                analysis.columnAnalysis[column] = {
                    dataType: typeof columnData[0],
                    nonNullCount,
                    nullCount,
                    nullPercentage: ((nullCount / totalRecords) * 100).toFixed(2)
                };

                // Type-specific analysis
                if (typeof columnData[0] === 'number') {
                    const numbers = columnData.filter(val => typeof val === 'number');
                    if (numbers.length > 0) {
                        const sum = numbers.reduce((a, b) => a + b, 0);
                        const avg = sum / numbers.length;
                        const sorted = numbers.sort((a, b) => a - b);
                        
                        analysis.columnAnalysis[column] = {
                            ...analysis.columnAnalysis[column],
                            min: Math.min(...numbers),
                            max: Math.max(...numbers),
                            average: parseFloat(avg.toFixed(2)),
                            median: sorted[Math.floor(sorted.length / 2)],
                            sum: sum
                        };
                    }
                } else if (typeof columnData[0] === 'string') {
                    const uniqueValues = [...new Set(columnData)];
                    const valueCounts = columnData.reduce((acc: Record<string, number>, val) => {
                        const key = String(val);
                        acc[key] = (acc[key] || 0) + 1;
                        return acc;
                    }, {});
                    
                    analysis.columnAnalysis[column] = {
                        ...analysis.columnAnalysis[column],
                        uniqueCount: uniqueValues.length,
                        topValues: Object.entries(valueCounts)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 5)
                            .map(([value, count]) => ({ value, count }))
                    };
                }
            }

            // Generate insights
            analysis.insights = [
                `Table contains ${actualTotal} total records across ${columns.length} columns`,
                `Data types: ${Object.entries(analysis.columnAnalysis)
                    .map(([col, info]) => `${col} (${info.dataType})`)
                    .join(', ')}`,
                `Completeness: ${columns.map(col => {
                    const colAnalysis = analysis.columnAnalysis[col];
                    return `${col}: ${(100 - parseFloat(colAnalysis.nullPercentage)).toFixed(1)}% complete`;
                }).join(', ')}`
            ];

            // Add numerical insights
            const numericColumns = Object.entries(analysis.columnAnalysis)
                .filter(([, info]) => info.dataType === 'number')
                .map(([col]) => col);
            
            if (numericColumns.length > 0) {
                analysis.insights.push(`Numeric columns (${numericColumns.length}): ${numericColumns.join(', ')}`);
            }

            return {
                success: true,
                tableName,
                analysis,
                rawDataSample: data.slice(0, 5), // First 5 rows as sample
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to generate analytics report',
                tableName
            };
        }
    },
});

// Tool for displaying analytics in table/markdown format
export const displayAnalytics = tool({
    description: 'Display analytics report in formatted table and markdown format',
    parameters: z.object({
        analysisData: z.object({
            success: z.boolean(),
            tableName: z.string(),
            analysis: z.object({
                summary: z.record(z.any()),
                columnAnalysis: z.record(z.any()),
                insights: z.array(z.string())
            }),
            rawDataSample: z.array(z.record(z.any())).optional()
        }).describe('The analysis data to format and display')
    }),
    execute: async ({ analysisData }) => {
        try {
            if (!analysisData.success) {
                return {
                    success: false,
                    error: 'Cannot display analytics for failed analysis'
                };
            }

            const { tableName, analysis, rawDataSample } = analysisData;
            
            // Generate markdown report
            let markdown = `# 📊 Analytics Report: ${tableName}\n\n`;
            
            // Summary section
            markdown += `## 📋 Summary\n\n`;
            markdown += `| Metric | Value |\n`;
            markdown += `|--------|-------|\n`;
            markdown += `| **Table Name** | ${analysis.summary.tableName} |\n`;
            markdown += `| **Total Records** | ${analysis.summary.totalRecords.toLocaleString()} |\n`;
            markdown += `| **Columns** | ${analysis.summary.columnsCount} |\n`;
            markdown += `| **Sample Size** | ${analysis.summary.sampleSize} |\n`;
            markdown += `| **Analysis Type** | ${analysis.summary.analysisType} |\n\n`;

            // Column Analysis section
            markdown += `## 🔍 Column Analysis\n\n`;
            markdown += `| Column | Data Type | Non-Null | Null % | Additional Info |\n`;
            markdown += `|--------|-----------|----------|--------|----------------|\n`;
            
            Object.entries(analysis.columnAnalysis).forEach(([column, info]) => {
                const typedInfo = info as ColumnAnalysis;
                let additionalInfo = '';
                
                if (typedInfo.dataType === 'number') {
                    additionalInfo = `Min: ${typedInfo.min}, Max: ${typedInfo.max}, Avg: ${typedInfo.average}`;
                } else if (typedInfo.dataType === 'string') {
                    additionalInfo = `Unique: ${typedInfo.uniqueCount}`;
                }
                
                markdown += `| **${column}** | ${typedInfo.dataType} | ${typedInfo.nonNullCount} | ${typedInfo.nullPercentage}% | ${additionalInfo} |\n`;
            });

            // Detailed Statistics for Numeric Columns
            const numericColumns = Object.entries(analysis.columnAnalysis)
                .filter(([, info]) => (info as ColumnAnalysis).dataType === 'number');
            
            if (numericColumns.length > 0) {
                markdown += `\n## 📈 Numeric Column Statistics\n\n`;
                markdown += `| Column | Min | Max | Average | Median | Sum |\n`;
                markdown += `|--------|-----|-----|---------|--------|----- |\n`;
                
                numericColumns.forEach(([column, info]) => {
                    const typedInfo = info as ColumnAnalysis;
                    markdown += `| **${column}** | ${typedInfo.min} | ${typedInfo.max} | ${typedInfo.average} | ${typedInfo.median} | ${typedInfo.sum} |\n`;
                });
            }

            // Top Values for String Columns
            const stringColumns = Object.entries(analysis.columnAnalysis)
                .filter(([, info]) => (info as ColumnAnalysis).dataType === 'string' && (info as ColumnAnalysis).topValues);
            
            if (stringColumns.length > 0) {
                markdown += `\n## 🏷️ Top Values in Text Columns\n\n`;
                
                stringColumns.forEach(([column, info]) => {
                    const typedInfo = info as ColumnAnalysis;
                    markdown += `### ${column}\n`;
                    markdown += `| Value | Count |\n`;
                    markdown += `|-------|-------|\n`;
                    typedInfo.topValues?.forEach((item) => {
                        markdown += `| ${item.value} | ${item.count} |\n`;
                    });
                    markdown += `\n`;
                });
            }

            // Data Sample section
            if (rawDataSample && rawDataSample.length > 0) {
                markdown += `## 📄 Data Sample (First 5 Records)\n\n`;
                
                const columns = Object.keys(rawDataSample[0]);
                markdown += `| ${columns.join(' | ')} |\n`;
                markdown += `| ${columns.map(() => '---').join(' | ')} |\n`;
                
                rawDataSample.forEach(row => {
                    const values = columns.map(col => {
                        const value = row[col];
                        return value === null || value === undefined ? 'NULL' : String(value);
                    });
                    markdown += `| ${values.join(' | ')} |\n`;
                });
            }

            // Insights section
            markdown += `\n## 💡 Key Insights\n\n`;
            analysis.insights.forEach((insight: string, index: number) => {
                markdown += `${index + 1}. ${insight}\n`;
            });

            markdown += `\n---\n*Report generated on ${new Date().toLocaleString()}*\n`;

            return {
                success: true,
                markdown,
                tableName,
                recordCount: analysis.summary.totalRecords,
                columnCount: analysis.summary.columnsCount,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to display analytics',
                fallbackMessage: 'Unable to format analytics report'
            };
        }
    },
});
