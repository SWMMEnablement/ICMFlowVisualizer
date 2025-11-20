import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get('/api/workflow', async (_req, res) => {
    try {
      const workflow = await storage.getWorkflowDefinition();
      res.json(workflow);
    } catch (error) {
      console.error('Error fetching workflow:', error);
      res.status(500).json({ error: 'Failed to fetch workflow data' });
    }
  });

  app.get('/api/logs', async (_req, res) => {
    try {
      const logs = await storage.getLogs();
      res.json(logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      res.status(500).json({ error: 'Failed to fetch logs' });
    }
  });

  app.post('/api/ai/explain', async (req, res) => {
    try {
      const { message, context } = req.body;
      
      const client = new OpenAI({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });

      const workflow = await storage.getWorkflowDefinition();
      const workflowContext = JSON.stringify({
        nodes: workflow.nodes.map(n => ({ id: n.id, label: n.label, type: n.type, script: n.script, description: n.description })),
        statistics: workflow.statistics
      }, null, 2);

      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 1024,
        system: `You are a helpful assistant that explains the SWMM5 to ICM SWMM batch import workflow. You help engineers understand what each step does, how the UI and Exchange scripts work together, and explain the file relationships and import process. Be concise, technical, but clear. 

Current Workflow Structure:
${workflowContext}`,
        messages: [
          {
            role: "user",
            content: message
          }
        ]
      });

      const assistantMessage = response.choices[0]?.message?.content;
      if (assistantMessage) {
        res.json({ response: assistantMessage });
      } else {
        res.status(500).json({ error: 'Unexpected response type from AI' });
      }
    } catch (error) {
      console.error('Error in AI explanation:', error);
      res.status(500).json({ error: 'Failed to generate explanation' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
