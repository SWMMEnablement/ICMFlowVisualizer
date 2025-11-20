import { useState, useEffect, useRef } from "react";
import { type WorkflowNode, type WorkflowDefinition, type LogEntry } from "@shared/schema";
import { MetadataPanel } from "@/components/MetadataPanel";
import { LegendPanel } from "@/components/LegendPanel";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import { WorkflowStepList } from "@/components/WorkflowStepList";
import { AIAssistant } from "@/components/AIAssistant";
import { WorkflowCanvas } from "@/components/WorkflowCanvas";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Info, PanelRightClose, PanelRightOpen, List, ListCollapse, Upload, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

type PhaseFilter = 'all';

export default function WorkflowVisualization() {
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | undefined>();
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isStepListOpen, setIsStepListOpen] = useState(true);
  const [isMarkdownOpen, setIsMarkdownOpen] = useState(false);
  const [phaseFilter] = useState<PhaseFilter>('all');
  const [isParsingFile, setIsParsingFile] = useState(false);
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

    setIsParsingFile(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      fetch('/api/parse-ruby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rubyCode: content })
      })
        .then(r => r.json())
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['/api/workflow'] });
          setSelectedNode(undefined);
          setIsParsingFile(false);
        })
        .catch(error => {
          console.error('Error parsing Ruby file:', error);
          setIsParsingFile(false);
        });
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsStepListOpen(!isStepListOpen)}
              data-testid="button-toggle-steps"
            >
              {isStepListOpen ? (
                <>
                  <ListCollapse className="w-4 h-4 mr-2" />
                  Hide Steps
                </>
              ) : (
                <>
                  <List className="w-4 h-4 mr-2" />
                  Show Steps
                </>
              )}
            </Button>
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
            <Sheet open={isLegendOpen} onOpenChange={setIsLegendOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" data-testid="button-legend">
                  <Info className="w-4 h-4 mr-2" />
                  Legend
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[400px] sm:w-[540px]">
                <LegendPanel />
              </SheetContent>
            </Sheet>
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

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
          <WorkflowCanvas
            nodes={filteredNodes}
            edges={filteredEdges}
            onNodeSelect={setSelectedNode}
            selectedNodeId={selectedNode?.id}
          />
        </div>
        
        {isStepListOpen && (
          <div className="w-[420px] flex-shrink-0">
            {isParsingFile ? (
              <div className="h-full bg-card border-r border-border flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-muted-foreground">Parsing Ruby file...</p>
                </div>
              </div>
            ) : (
              <WorkflowStepList
                nodes={filteredNodes}
                selectedNodeId={selectedNode?.id}
                onNodeSelect={setSelectedNode}
              />
            )}
          </div>
        )}

        {isPanelOpen && (
          <div className="flex-1 min-w-0">
            <MetadataPanel
              selectedNode={selectedNode}
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
