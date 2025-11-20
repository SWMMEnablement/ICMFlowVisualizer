import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleGenAI } from "@google/genai";

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
      
      // Using Replit AI Integrations for Gemini access (no API key required, billed to credits)
      const ai = new GoogleGenAI({
        apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY || "dummy",
        httpOptions: {
          apiVersion: "",
          baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
        },
      });

      const workflow = await storage.getWorkflowDefinition();
      const nodeList = workflow.nodes.map(n => `- ${n.label} (${n.type})`).join('\n');

      const fullMessage = `You are an expert in SWMM5 to ICM SWMM workflows and Ruby scripting. Please help explain the following based on the workflow context.

Workflow Overview:
${nodeList}

User Question:
${message}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullMessage,
      });

      const text = response.text || "";

      res.json({ response: text });
    } catch (error) {
      console.error('Error in AI explanation:', error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Failed to generate explanation' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
