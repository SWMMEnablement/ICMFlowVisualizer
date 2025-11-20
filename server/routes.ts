import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
      const { message } = req.body;
      
      if (!process.env.AI_INTEGRATIONS_GEMINI_API_KEY) {
        console.error('Missing API key');
        return res.status(500).json({ error: 'AI service not configured' });
      }

      const client = new GoogleGenerativeAI({
        apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
      });

      const workflow = await storage.getWorkflowDefinition();
      const workflowContext = JSON.stringify({
        nodes: workflow.nodes.map(n => ({ id: n.id, label: n.label, type: n.type, script: n.script, description: n.description })),
        statistics: workflow.statistics
      }, null, 2);

      const model = client.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: `You are a helpful assistant that explains the SWMM5 to ICM SWMM batch import workflow. You help engineers understand what each step does, how the UI and Exchange scripts work together, and explain the file relationships and import process. Be concise, technical, but clear. 

Current Workflow Structure:
${workflowContext}`
      });

      const response = await model.generateContent(message);
      const text = response.response.text();

      res.json({ response: text });
    } catch (error) {
      console.error('Error in AI explanation:', error);
      res.status(500).json({ error: 'Failed to generate explanation' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
