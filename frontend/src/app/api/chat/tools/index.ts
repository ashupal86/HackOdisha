import { tool } from 'ai';
import { z } from 'zod';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { executeDbQuery, getFullDatabaseSchema, getForeignKeys, checkTableExists } from '@/dbFunctions/db';

// ------------------ TYPES ------------------
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

// ------------------ TOOLS ------------------

// 1. Fetch database schema
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

// 2. Query safety check
export const querySafetyCheck = tool({
  description: 'Check if a SQL query is safe to execute',
  parameters: z.object({
    query: z.string().describe('The SQL query to check for safety'),
  }),
  execute: async ({ query }) => {
    console.log("checking safe query.................");
    try {
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

      if (upperQuery.includes('UPDATE')) {
        return {
          safe: true,
          reason: 'UPDATE operation detected - proceed with caution',
          requiresApproval: false,
          isUpdate: true
        };
      }

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

// 3. Generate safe SQL query
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
    }).optional()
  }),
  execute: async ({ request, databaseSchema }) => {
    console.log("Generating safe query based on dynamic schema.................");
    try {
      let schemaToUse = databaseSchema;

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

      if (!schemaToUse.schema || Object.keys(schemaToUse.schema).length === 0) {
        return {
          success: false,
          error: 'No tables found in the database schema.',
          originalRequest: request
        };
      }

      const schemaInfo = Object.entries(schemaToUse.schema).map(([tableName, tableInfo]) => {
        const typedTableInfo = tableInfo as {
          columns: Array<{ column_name: string; data_type: string; character_maximum_length?: number; is_nullable: string; column_default?: string }>
        };
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

SQL Query:`;

      const response = await generateText({
        model: google('gemini-1.5-flash'),
        prompt,
        maxTokens: 300,
      });

      const sqlQuery = response.text.trim().replace(/```sql|```/g, '');
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

// 4. Execute query
export const executeQuery = tool({
  description: 'Execute a validated SQL query on the PostgreSQL database',
  parameters: z.object({
    query: z.string(),
    queryType: z.string(),
    targetTable: z.string().optional(),
  }),
  execute: async ({ query, queryType, targetTable }) => {
    console.log("Executing database query.................");
    try {
      if (targetTable && (queryType.toUpperCase() === 'INSERT' || queryType.toUpperCase() === 'UPDATE')) {
        const tableExists = await checkTableExists(targetTable);
        if (!tableExists) {
          return {
            success: false,
            error: `Table '${targetTable}' does not exist.`,
            query,
            timestamp: new Date().toISOString()
          };
        }
      }

      console.log(`Executing ${queryType} query:`, query);

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
          message: `Inserted ${result.data?.rowCount || 1} record(s).`,
          query,
          timestamp: new Date().toISOString()
        };
      } else if (queryType.toUpperCase() === 'SELECT') {
        return {
          success: true,
          result: result.data?.rows,
          message: `Retrieved ${result.data?.rowCount || 0} record(s).`,
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
          message: `Updated ${result.data?.rowCount || 0} record(s).`,
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

// 5. Generate user-friendly response
export const generateResponse = tool({
  description: 'Generate a user-friendly response about the database operation result',
  parameters: z.object({
    originalRequest: z.string(),
    queryResult: z.object({
      success: z.boolean(),
      result: z.any().optional(),
      message: z.string().optional(),
      error: z.string().optional(),
      rowCount: z.number().optional(),
    }),
    sqlQuery: z.string(),
    schemaInfo: z.object({
      usedSchema: z.boolean().optional(),
      availableTables: z.array(z.string()).optional(),
      targetTable: z.string().optional()
    }).optional(),
  }),
  execute: async ({ originalRequest, queryResult, sqlQuery, schemaInfo }) => {
    console.log("Generating user-friendly response.................");
    try {
      const schemaContext = schemaInfo?.usedSchema
        ? `The query was generated using the database schema with ${schemaInfo.availableTables?.length || 0} tables.`
        : '';

      const prompt = `Generate a friendly response about this database operation:

Request: "${originalRequest}"
SQL: "${sqlQuery}"
Result: ${JSON.stringify(queryResult, null, 2)}
Schema: ${schemaContext}

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
          : 'There was an error. Please try again.'
      };
    }
  },
});

// 6. Generate analytics report
export const generateAnalyticsReport = tool({
  description: 'Generate analytics report from a table',
  parameters: z.object({
    tableName: z.string(),
    analysisType: z.string().optional()
  }),
  execute: async ({ tableName, analysisType = 'detailed' }) => {
    try {
      console.log(`Generating analytics for table: ${tableName}...`);

      const dataQuery = `SELECT * FROM ${tableName} LIMIT 1000`;
      const dataResult = await executeDbQuery(dataQuery);

      if (!dataResult.success) {
        return {
          success: false,
          error: `Failed to fetch data: ${dataResult.error}`
        };
      }

      const data = dataResult.data?.rows || [];
      const totalRecords = data.length;

      if (totalRecords === 0) {
        return {
          success: true,
          tableName,
          analysis: {
            summary: { totalRecords: 0, message: 'No data found' }
          },
          timestamp: new Date().toISOString()
        };
      }

      const countQuery = `SELECT COUNT(*) as total FROM ${tableName}`;
      const countResult = await executeDbQuery(countQuery);
      const actualTotal = countResult.success && countResult.data?.rows[0]
        ? parseInt(String(countResult.data.rows[0].total))
        : totalRecords;

      const columns = Object.keys(data[0]);

      const analysis: Analysis = {
        summary: {
          tableName,
          totalRecords: actualTotal,
          columnsCount: columns.length,
          columns,
          sampleSize: totalRecords,
          analysisType
        },
        columnAnalysis: {},
        insights: []
      };

      for (const column of columns) {
        const columnData = data.map(row => row[column]).filter(v => v !== null && v !== undefined);
        const nonNullCount = columnData.length;
        const nullCount = totalRecords - nonNullCount;

        const base: ColumnAnalysis = {
          dataType: typeof columnData[0],
          nonNullCount,
          nullCount,
          nullPercentage: ((nullCount / totalRecords) * 100).toFixed(2)
        };

        if (typeof columnData[0] === 'number') {
          const numbers = columnData as number[];
          if (numbers.length > 0) {
            const sum = numbers.reduce((a, b) => a + b, 0);
            const avg = sum / numbers.length;
            const sorted = [...numbers].sort((a, b) => a - b);

            analysis.columnAnalysis[column] = {
              ...base,
              min: Math.min(...numbers),
              max: Math.max(...numbers),
              average: parseFloat(avg.toFixed(2)),
              median: sorted[Math.floor(sorted.length / 2)],
              sum
            };
          }
        } else if (typeof columnData[0] === 'string') {
          const uniqueValues = [...new Set(columnData)];
          const valueCounts = (columnData as string[]).reduce((acc: Record<string, number>, val) => {
            acc[val] = (acc[val] || 0) + 1;
            return acc;
          }, {});

          analysis.columnAnalysis[column] = {
            ...base,
            uniqueCount: uniqueValues.length,
            topValues: Object.entries(valueCounts)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([value, count]) => ({ value, count }))
          };
        } else {
          analysis.columnAnalysis[column] = base;
        }
      }

      analysis.insights = [
        `Table has ${actualTotal} records across ${columns.length} columns.`,
        ...columns.map(col => {
          const colAnalysis = analysis.columnAnalysis[col];
          return `${col}: ${(100 - parseFloat(colAnalysis.nullPercentage)).toFixed(1)}% complete`;
        })
      ];

      return {
        success: true,
        tableName,
        analysis,
        rawDataSample: data.slice(0, 5),
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

// 7. Display analytics
export const displayAnalytics = tool({
  description: 'Display analytics report in markdown format',
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
    })
  }),
  execute: async ({ analysisData }) => {
    try {
      if (!analysisData.success) {
        return { success: false, error: 'Cannot display analytics for failed analysis' };
      }

      const { tableName, analysis, rawDataSample } = analysisData;
      let markdown = `# 📊 Analytics Report: ${tableName}\n\n`;

      // Summary
      markdown += `## 📋 Summary\n\n| Metric | Value |\n|--------|-------|\n`;
      Object.entries(analysis.summary).forEach(([k, v]) => {
        markdown += `| **${k}** | ${v} |\n`;
      });

      // Column analysis
      markdown += `\n## 🔍 Column Analysis\n\n| Column | Data Type | Non-Null | Null % | Extra |\n|--------|-----------|----------|--------|-------|\n`;
      Object.entries(analysis.columnAnalysis).forEach(([col, info]) => {
        const c = info as ColumnAnalysis;
        let extra = '';
        if (c.dataType === 'number') extra = `Min: ${c.min}, Max: ${c.max}, Avg: ${c.average}`;
        if (c.dataType === 'string') extra = `Unique: ${c.uniqueCount}`;
        markdown += `| ${col} | ${c.dataType} | ${c.nonNullCount} | ${c.nullPercentage}% | ${extra} |\n`;
      });

      // Data sample
      if (rawDataSample?.length) {
        markdown += `\n## 📄 Data Sample (5 rows)\n\n`;
        const cols = Object.keys(rawDataSample[0]);
        markdown += `| ${cols.join(' | ')} |\n| ${cols.map(() => '---').join(' | ')} |\n`;
        rawDataSample.forEach(row => {
          markdown += `| ${cols.map(c => row[c] ?? 'NULL').join(' | ')} |\n`;
        });
      }

      // Insights
      markdown += `\n## 💡 Insights\n\n`;
      analysis.insights.forEach((i, idx) => {
        markdown += `${idx + 1}. ${i}\n`;
      });

      markdown += `\n---\n*Generated ${new Date().toLocaleString()}*\n`;

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
        error: error instanceof Error ? error.message : 'Failed to display analytics'
      };
    }
  },
});
