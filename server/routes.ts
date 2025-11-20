import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleGenAI } from "@google/genai";
import { parseRubyFile, workflowToMarkdown } from "./ruby-parser";

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

  app.post('/api/parse-ruby', async (req, res) => {
    try {
      const { rubyCode } = req.body;
      if (!rubyCode || typeof rubyCode !== 'string') {
        return res.status(400).json({ error: 'Invalid Ruby code provided' });
      }
      const workflow = parseRubyFile(rubyCode);
      await storage.setWorkflowDefinition(workflow);
      res.json(workflow);
    } catch (error) {
      console.error('Error parsing Ruby file:', error);
      res.status(500).json({ error: 'Failed to parse Ruby file' });
    }
  });

  app.post('/api/markdown/generate', async (req, res) => {
    try {
      const workflow = await storage.getWorkflowDefinition();
      const markdown = workflowToMarkdown(workflow);
      await storage.setMarkdownDocument({
        title: 'Ruby Workflow Documentation',
        content: markdown
      });
      res.json({ content: markdown });
    } catch (error) {
      console.error('Error generating markdown:', error);
      res.status(500).json({ error: 'Failed to generate markdown' });
    }
  });

  app.post('/api/markdown/save', async (req, res) => {
    try {
      const { title, content } = req.body;
      await storage.setMarkdownDocument({ title, content });
      res.json({ success: true });
    } catch (error) {
      console.error('Error saving markdown:', error);
      res.status(500).json({ error: 'Failed to save markdown' });
    }
  });

  app.get('/api/markdown', async (_req, res) => {
    try {
      const doc = await storage.getMarkdownDocument();
      res.json(doc || { title: '', content: '' });
    } catch (error) {
      console.error('Error fetching markdown:', error);
      res.status(500).json({ error: 'Failed to fetch markdown' });
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

      const fullMessage = `You are an expert in Ruby scripting. Please help explain the following based on the workflow context.

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
