import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface RubyFileUploadProps {
  onSuccess?: () => void;
}

export function RubyFileUpload({ onSuccess }: RubyFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const parseRubyMutation = useMutation({
    mutationFn: async (rubyCode: string) => {
      const response = await fetch('/api/parse-ruby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rubyCode })
      });
      if (!response.ok) throw new Error('Failed to parse Ruby file');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workflow'] });
      toast({ title: "Success", description: "Ruby file parsed successfully" });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to parse Ruby file",
        variant: "destructive"
      });
    }
  });

  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith('.rb')) {
      toast({ title: "Error", description: "Please select a .rb file", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      parseRubyMutation.mutate(content);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file) handleFileSelect(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Load Ruby File
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-border'
          }`}
        >
          <Input
            type="file"
            accept=".rb"
            onChange={handleChange}
            disabled={parseRubyMutation.isPending}
            className="hidden"
            id="ruby-file-input"
            data-testid="input-ruby-file"
          />
          <label htmlFor="ruby-file-input" className="cursor-pointer block">
            <div className="flex flex-col items-center gap-2">
              {parseRubyMutation.isPending ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Parsing Ruby file...</p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm font-medium">Drag and drop your .rb file here</p>
                  <p className="text-xs text-muted-foreground">or click to browse</p>
                </>
              )}
            </div>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
