import { useState } from "react";
import { type WorkflowNode } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantProps {
  selectedNode?: WorkflowNode;
}

export function AIAssistant({ selectedNode }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm here to explain the SWMM5 to ICM SWMM workflow. Ask me about any step, the UI script, Exchange script, or how the import process works."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (messageText?: string) => {
    const userMessage = messageText || input.trim();
    if (!userMessage) return;

    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I encountered an error. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainCode = () => {
    if (!selectedNode?.metadata?.codeSnippet) return;
    const explanationRequest = `Explain what this Ruby code does:\n\n\`\`\`ruby\n${selectedNode.metadata.codeSnippet}\n\`\`\`\n\nContext: This is from the "${selectedNode.label}" step of the workflow (${selectedNode.script} script).`;
    handleSendMessage(explanationRequest);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" data-testid="button-ai-assistant">
          <Sparkles className="w-4 h-4 mr-2" />
          AI Assistant
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-lg h-[400px] flex flex-col" data-testid="dialog-ai-assistant">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Workflow Explainer
            </DialogTitle>
            <span className="text-xs text-muted-foreground font-mono">Gemini 3</span>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4 mb-4">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={cn(
                "flex gap-3",
                msg.role === 'user' ? "justify-end" : "justify-start"
              )}>
                <div className={cn(
                  "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                  msg.role === 'user'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                )}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="bg-muted text-foreground px-4 py-2 rounded-lg">
                  <p className="text-sm">Thinking...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground">Your question</label>
            <span className="text-xs text-muted-foreground font-mono">Powered by Gemini 3</span>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Ask about the workflow..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
              data-testid="input-ai-message"
            />
            <Button
              size="sm"
              onClick={() => handleSendMessage()}
              disabled={isLoading || !input.trim()}
              data-testid="button-send-message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          {selectedNode?.metadata?.codeSnippet && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleExplainCode}
              disabled={isLoading}
              className="w-full"
              data-testid="button-explain-code"
            >
              <Zap className="w-4 h-4 mr-2" />
              Explain Selected Code
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
