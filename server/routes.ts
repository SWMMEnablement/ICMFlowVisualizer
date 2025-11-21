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

  app.post('/api/ai-analyze', async (req, res) => {
    try {
      const { code, context } = req.body;
      
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: 'Invalid code provided' });
      }

      // Using Replit AI Integrations for Gemini access
      const ai = new GoogleGenAI({
        apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY || "dummy",
        httpOptions: {
          apiVersion: "",
          baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
        },
      });

      const prompt = `You are an expert Ruby developer specializing in ICM InfoWorks automation scripts. Analyze the following Ruby code and provide a detailed overview.

RUBY CODE:
\`\`\`ruby
${code}
\`\`\`

Provide:
1. A brief summary of what this code does
2. Key classes and their purposes
3. Important methods and their functionality
4. Any patterns or conventions used
5. Dependencies or external integrations

Keep the analysis concise but informative, written for a technical audience familiar with Ruby and InfoWorks.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const analysis = response.text || "Unable to analyze code";

      res.json({ analysis });
    } catch (error) {
      console.error('Error in AI analysis:', error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Failed to analyze code' });
    }
  });

  app.post('/api/nano-explain', async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: 'Invalid code provided' });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY || "dummy",
        httpOptions: {
          apiVersion: "",
          baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
        },
      });

      const prompt = `Explain this Ruby code using the Nano Banana Prompt framework. Structure your explanation as:

1. **What it does**: High-level summary in 1-2 sentences
2. **How it works**: Step-by-step walkthrough of the logic
3. **Key components**: Important classes, methods, or patterns used
4. **Why it matters**: Relevance to ICM InfoWorks context

Keep explanations concise and technical. Use examples where helpful.

RUBY CODE:
\`\`\`ruby
${code}
\`\`\``;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const explanation = response.text || "Unable to generate explanation";

      res.json({ explanation });
    } catch (error) {
      console.error('Error in nano explanation:', error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Failed to generate explanation' });
    }
  });

  app.post('/api/mermaid-diagram', async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: 'Invalid code provided' });
      }

      // Extract code structure
      const classMatches = Array.from(code.matchAll(/class\s+(\w+)/g)).map(m => m[1]);
      const methodMatches = Array.from(code.matchAll(/def\s+(\w+)/g)).map(m => m[1]).filter(m => m !== 'initialize');
      const ifMatches = code.match(/if\s+/g) || [];
      const loopMatches = code.match(/\.each|while|until/g) || [];

      // Build ASCII diagram
      let diagram = '┌─ CODE STRUCTURE DIAGRAM ─┐\n\n';
      diagram += '  ┌──────────────┐\n';
      diagram += '  │    START     │\n';
      diagram += '  └──────┬───────┘\n';
      diagram += '         │\n';
      
      // Add classes if present
      if (classMatches.length > 0) {
        diagram += '  ┌──────────────────────────────┐\n';
        if (classMatches.length === 1) {
          diagram += `  │  CLASS: ${classMatches[0].padEnd(18)}  │\n`;
        } else {
          diagram += `  │  CLASSES (${classMatches.length})${' '.repeat(14)}  │\n`;
          classMatches.forEach(cls => {
            diagram += `  │    • ${cls}${' '.repeat(Math.max(0, 20 - cls.length))}│\n`;
          });
        }
        diagram += '  └──────────────────────────────┘\n';
        diagram += '         │\n';
      }
      
      // Add methods if present
      if (methodMatches.length > 0) {
        diagram += '  ┌──────────────────────────────┐\n';
        if (methodMatches.length === 1) {
          diagram += `  │  METHOD: ${methodMatches[0].padEnd(18)}  │\n`;
        } else {
          diagram += `  │  METHODS (${methodMatches.length})${' '.repeat(14)}  │\n`;
          methodMatches.slice(0, 3).forEach(method => {
            diagram += `  │    • ${method}${' '.repeat(Math.max(0, 20 - method.length))}│\n`;
          });
          if (methodMatches.length > 3) {
            diagram += `  │    ... and ${methodMatches.length - 3} more        │\n`;
          }
        }
        diagram += '  └──────────────────────────────┘\n';
        diagram += '         │\n';
      }
      
      // Add conditionals
      if (ifMatches.length > 0) {
        diagram += '  ┌──────────────────────────────┐\n';
        diagram += `  │  LOGIC BRANCHES (${ifMatches.length})${' '.repeat(8)}  │\n`;
        diagram += '  └──────────────────────────────┘\n';
        diagram += '         │\n';
      }
      
      // Add loops
      if (loopMatches.length > 0) {
        diagram += '  ┌──────────────────────────────┐\n';
        diagram += `  │  ITERATIONS (${loopMatches.length})${' '.repeat(12)}  │\n`;
        diagram += '  └──────────────────────────────┘\n';
        diagram += '         │\n';
      }
      
      // Add end point
      diagram += '  ┌──────────────┐\n';
      diagram += '  │   COMPLETE   │\n';
      diagram += '  └──────────────┘\n';

      res.json({ diagram: diagram.trim() });
    } catch (error) {
      console.error('Error generating diagram:', error instanceof Error ? error.message : String(error));
      const fallback = `┌─ CODE STRUCTURE ─┐
│  ┌──────────────┐
│  │    START     │
│  └──────┬───────┘
│         │
│  ┌──────────────┐
│  │ Ruby Code    │
│  └──────┬───────┘
│         │
│  ┌──────────────┐
│  │   COMPLETE   │
│  └──────────────┘`;
      res.json({ diagram: fallback });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
