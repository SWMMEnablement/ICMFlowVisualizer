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
      
      const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error('Missing Gemini API key. Available env vars:', Object.keys(process.env).filter(k => k.includes('GEMINI') || k.includes('AI')));
        return res.status(500).json({ error: 'AI service not configured' });
      }

      const client = new GoogleGenerativeAI({
        apiKey: apiKey,
      });

      const workflow = await storage.getWorkflowDefinition();
      const nodeList = workflow.nodes.map(n => `- ${n.label} (${n.type})`).join('\n');

      const fullMessage = `You are an expert in SWMM5 to ICM SWMM workflows and Ruby scripting. Please help explain the following based on the workflow context.

Workflow Overview:
${nodeList}

User Question:
${message}`;

      const model = client.getGenerativeModel({ 
        model: "gemini-1.5-flash"
      });

      const response = await model.generateContent(fullMessage);
      const text = response.response.text();

      res.json({ response: text });
    } catch (error) {
      console.error('Error in AI explanation:', error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Failed to generate explanation' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
