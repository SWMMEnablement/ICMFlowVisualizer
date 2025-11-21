import { useState, useEffect, useRef } from "react";
import { type WorkflowNode, type WorkflowDefinition, type LogEntry } from "@shared/schema";
import { MetadataPanel } from "@/components/MetadataPanel";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import { AIAssistant } from "@/components/AIAssistant";
import { WorkflowCanvas } from "@/components/WorkflowCanvas";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { ReferenceModal } from "@/components/ReferenceModal";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PanelRightClose, PanelRightOpen, Upload, FileText, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

type PhaseFilter = 'all';

export default function WorkflowVisualization() {
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | undefined>();
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isMarkdownOpen, setIsMarkdownOpen] = useState(false);
  const [isReferenceOpen, setIsReferenceOpen] = useState(false);
  const [phaseFilter] = useState<PhaseFilter>('all');
  const [rubyCode, setRubyCode] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: workflowData, isLoading, error } = useQuery<WorkflowDefinition>({
    queryKey: ['/api/workflow'],
  });

  const { data: logs = [], isLoading: logsLoading, error: logsError } = useQuery<LogEntry[]>({
    queryKey: ['/api/logs'],
  });

  useEffect(() => {
    if (workflowData?.nodes && !selectedNode) {
      const startNode = workflowData.nodes.find(node => node.id === 'start');
      if (startNode) {
        setSelectedNode(startNode);
      }
    }
  }, [workflowData, selectedNode]);

  const filteredNodes = workflowData?.nodes || [];

  const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = workflowData?.edges.filter(edge => 
    visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
  ) || [];

  useEffect(() => {
    if (selectedNode && !visibleNodeIds.has(selectedNode.id)) {
      const startNode = filteredNodes.find(node => node.id === 'start');
      setSelectedNode(startNode);
    }
  }, [phaseFilter]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.rb')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRubyCode(content);
      setFileName(file.name);
    };
    reader.readAsText(file);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading workflow visualization...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-3">
          <p className="text-destructive">Error loading workflow data</p>
          <p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  if (!workflowData) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">No workflow data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <OnboardingDialog />
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">
                ICM InfoWorks Ruby Visualizer
              </h1>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".rb"
              onChange={handleFileChange}
              className="hidden"
              data-testid="input-ruby-file-header"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fileInputRef.current?.click();
              }}
              data-testid="button-file-picker"
            >
              <Upload className="w-4 h-4 mr-2" />
              <span className="text-xs">Open .rb File</span>
            </Button>
          </div>


          <div className="flex gap-2">
            <AIAssistant selectedNode={selectedNode} />
            <Sheet open={isMarkdownOpen} onOpenChange={setIsMarkdownOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" data-testid="button-markdown">
                  <FileText className="w-4 h-4 mr-2" />
                  Documentation
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[500px] sm:w-[640px]">
                <MarkdownEditor />
              </SheetContent>
            </Sheet>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReferenceOpen(true)}
              data-testid="button-reference"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Reference
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPanelOpen(!isPanelOpen)}
              data-testid="button-toggle-panel"
            >
              {isPanelOpen ? (
                <>
                  <PanelRightClose className="w-4 h-4 mr-2" />
                  Hide Panel
                </>
              ) : (
                <>
                  <PanelRightOpen className="w-4 h-4 mr-2" />
                  Show Panel
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <ReferenceModal open={isReferenceOpen} onOpenChange={setIsReferenceOpen} />

      <div className="flex-1 flex overflow-hidden">
        <div className="w-[525px] flex-shrink-0 border-r border-border flex flex-col bg-card">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-sm">Ruby Code</h3>
            {fileName && <p className="text-xs text-muted-foreground mt-1">{fileName}</p>}
          </div>
          {rubyCode ? (
            <ScrollArea className="flex-1">
              <pre className="p-4 text-xs font-mono text-foreground whitespace-pre-wrap break-words leading-relaxed">
                {rubyCode}
              </pre>
            </ScrollArea>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center px-4">
              <div className="text-muted-foreground text-sm">
                <p className="mb-2">No Ruby file loaded</p>
                <p className="text-xs">Click "Open .rb File" to upload a Ruby script</p>
              </div>
            </div>
          )}
        </div>

        {isPanelOpen && (
          <div className="flex-1 min-w-0">
            <MetadataPanel
              selectedNode={selectedNode}
              rubyCode={rubyCode}
              fileName={fileName}
              fileConfigs={workflowData.fileConfigs}
              statistics={workflowData.statistics}
              logs={logs}
              logsLoading={logsLoading}
              logsError={logsError}
            />
          </div>
        )}
      </div>
    </div>
  );
}
