import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, X } from "lucide-react";

interface ReferenceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REFERENCE_FILES = [
  { id: "help", label: "Ruby API Help", file: "/reference/help.md" },
  { id: "database", label: "Database Reference", file: "/reference/database.md" },
  { id: "glossary", label: "Glossary", file: "/reference/glossary.md" },
  { id: "patterns", label: "Pattern Reference", file: "/reference/patterns.md" },
  { id: "tutorial", label: "Tutorial Context", file: "/reference/tutorial.md" },
];

export function ReferenceModal({ open, onOpenChange }: ReferenceModalProps) {
  const [selectedFile, setSelectedFile] = useState<string>("help");
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (fileId: string) => {
    setSelectedFile(fileId);
    setLoading(true);
    
    const file = REFERENCE_FILES.find(f => f.id === fileId);
    if (file) {
      try {
        const response = await fetch(file.file);
        const text = await response.text();
        setContent(text);
      } catch (error) {
        console.error("Error loading reference file:", error);
        setContent("Error loading reference file");
      }
    }
    setLoading(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (newOpen && !content) {
      handleFileChange(selectedFile);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Ruby Reference
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Select value={selectedFile} onValueChange={handleFileChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select reference..." />
            </SelectTrigger>
            <SelectContent>
              {REFERENCE_FILES.map((file) => (
                <SelectItem key={file.id} value={file.id}>
                  {file.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ScrollArea className="h-[60vh] w-full rounded-md border p-4 bg-muted/30">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <div className="text-sm text-foreground leading-relaxed space-y-4 pr-4">
                {content.split('\n').map((line, idx) => {
                  // Headers
                  if (line.startsWith('# ')) {
                    return <h2 key={idx} className="text-lg font-bold mt-4 mb-2">{line.slice(2)}</h2>;
                  }
                  if (line.startsWith('## ')) {
                    return <h3 key={idx} className="text-base font-semibold mt-3 mb-2">{line.slice(3)}</h3>;
                  }
                  if (line.startsWith('### ')) {
                    return <h4 key={idx} className="text-sm font-semibold mt-2 mb-1">{line.slice(4)}</h4>;
                  }
                  // Bold text
                  if (line.startsWith('- **')) {
                    const parts = line.split('**');
                    return <p key={idx} className="text-xs ml-4">• <span className="font-semibold">{parts[1]}</span> {parts.slice(2).join('**')}</p>;
                  }
                  // List items
                  if (line.startsWith('- ')) {
                    return <p key={idx} className="text-xs ml-4">• {line.slice(2)}</p>;
                  }
                  // Code blocks
                  if (line.startsWith('```')) {
                    return null;
                  }
                  // Empty lines
                  if (line.trim() === '') {
                    return <div key={idx} className="h-1" />;
                  }
                  // Regular text
                  return <p key={idx} className="text-xs">{line}</p>;
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
