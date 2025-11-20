import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Download, RotateCcw, Save, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";

export function MarkdownEditor() {
  const [title, setTitle] = useState("Ruby Workflow Documentation");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const { data: markdown } = useQuery({
    queryKey: ['/api/markdown'],
    queryFn: () => fetch('/api/markdown').then(r => r.json())
  });

  useEffect(() => {
    if (markdown?.content) {
      setContent(markdown.content);
      setTitle(markdown.title);
    }
  }, [markdown]);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/markdown/generate', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to generate markdown');
      return response.json();
    },
    onSuccess: (data) => {
      setContent(data.content);
      toast({ title: "Success", description: "Markdown generated from workflow" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate markdown", variant: "destructive" });
    }
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      setIsSaving(true);
      const response = await fetch('/api/markdown/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      if (!response.ok) throw new Error('Failed to save');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Markdown saved" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save markdown", variant: "destructive" });
    },
    onSettled: () => {
      setIsSaving(false);
    }
  });

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `${title.toLowerCase().replace(/\s+/g, '_')}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast({ title: "Success", description: "Markdown file downloaded" });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Markdown Documentation</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Document title"
          data-testid="input-markdown-title"
        />
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter markdown content..."
          className="flex-1 resize-none"
          data-testid="textarea-markdown"
        />
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            data-testid="button-generate-markdown"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate from Workflow
          </Button>
          <Button
            size="sm"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || isSaving}
            data-testid="button-save-markdown"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            disabled={!content}
            data-testid="button-download-markdown"
          >
            <Download className="w-4 h-4 mr-2" />
            Download .md
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { setContent(""); setTitle("Ruby Workflow Documentation"); }}
            data-testid="button-reset-markdown"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
