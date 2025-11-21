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
  { id: "database", label: "Database Reference", file: "/reference/database.md" },
  { id: "glossary", label: "Glossary", file: "/reference/glossary.md" },
  { id: "patterns", label: "Pattern Reference", file: "/reference/patterns.md" },
  { id: "tutorial", label: "Tutorial Context", file: "/reference/tutorial.md" },
];

export function ReferenceModal({ open, onOpenChange }: ReferenceModalProps) {
  const [selectedFile, setSelectedFile] = useState<string>("database");
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
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap break-words text-xs font-mono text-foreground">
                  {content}
                </pre>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
