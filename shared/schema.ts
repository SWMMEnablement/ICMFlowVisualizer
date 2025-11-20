import { z } from "zod";

export const workflowNodeSchema = z.object({
  id: z.string(),
  type: z.enum(['start', 'process', 'decision', 'data', 'end']),
  label: z.string(),
  description: z.string().optional(),
  script: z.enum(['ui', 'exchange']).optional(),
  position: z.object({
    x: z.number(),
    y: z.number()
  }),
  status: z.enum(['pending', 'processing', 'success', 'error', 'warning']).optional(),
  metadata: z.record(z.any()).optional()
});

export const workflowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
  type: z.enum(['primary', 'secondary', 'conditional']).default('primary')
});

export const fileConfigSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  filePath: z.string(),
  fileSize: z.number().optional(),
  modelGroupName: z.string(),
  status: z.enum(['pending', 'processing', 'success', 'error', 'warning']).optional()
});

export const importStatisticsSchema = z.object({
  filesProcessed: z.number().default(0),
  filesSuccessful: z.number().default(0),
  filesFailed: z.number().default(0),
  totalNodes: z.number().default(0),
  totalLinks: z.number().default(0),
  totalSubcatchments: z.number().default(0),
  totalLabelListsDeleted: z.number().default(0),
  failedFiles: z.array(z.object({
    file: z.string(),
    reason: z.string()
  })).default([])
});

export const workflowDefinitionSchema = z.object({
  nodes: z.array(workflowNodeSchema),
  edges: z.array(workflowEdgeSchema),
  statistics: importStatisticsSchema.optional(),
  fileConfigs: z.array(fileConfigSchema).optional()
});

export type WorkflowNode = z.infer<typeof workflowNodeSchema>;
export type WorkflowEdge = z.infer<typeof workflowEdgeSchema>;
export type FileConfig = z.infer<typeof fileConfigSchema>;
export type ImportStatistics = z.infer<typeof importStatisticsSchema>;
export type WorkflowDefinition = z.infer<typeof workflowDefinitionSchema>;

export const logEntrySchema = z.object({
  timestamp: z.string(),
  level: z.enum(['INFO', 'WARNING', 'ERROR', 'SUCCESS']),
  message: z.string(),
  file: z.string().optional()
});

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string()
});

export type LogEntry = z.infer<typeof logEntrySchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
