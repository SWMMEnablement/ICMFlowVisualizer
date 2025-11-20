import { useState, useEffect } from "react";
import { type WorkflowNode, type WorkflowDefinition, type LogEntry } from "@shared/schema";
import { MetadataPanel } from "@/components/MetadataPanel";
import { LegendPanel } from "@/components/LegendPanel";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import { WorkflowStepList } from "@/components/WorkflowStepList";
import { AIAssistant } from "@/components/AIAssistant";
import { RubyFileUpload } from "@/components/RubyFileUpload";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Info, PanelRightClose, PanelRightOpen, Filter, List, ListCollapse, Github, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type PhaseFilter = 'all';

export default function WorkflowVisualization() {
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | undefined>();
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isStepListOpen, setIsStepListOpen] = useState(true);
  const [isMarkdownOpen, setIsMarkdownOpen] = useState(false);
  const [phaseFilter] = useState<PhaseFilter>('all');

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
            <Button
              variant="ghost"
              size="sm"
              asChild
              data-testid="button-github"
            >
              <a
                href="https://github.com/innovyze/Open-Source-Support/tree/main/01%20InfoWorks%20ICM/01%20Ruby/02%20SWMM/0022%20-%20Hackathon%20AWI%20OffShoots"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Github className="w-4 h-4" />
                <span className="text-xs">View Source</span>
              </a>
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
          <RubyFileUpload onSuccess={() => {}} />
        </div>
        
        {isStepListOpen && (
          <div className="w-[420px] flex-shrink-0">
            <WorkflowStepList
              nodes={filteredNodes}
              selectedNodeId={selectedNode?.id}
              onNodeSelect={setSelectedNode}
            />
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
