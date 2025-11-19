import { useState, useEffect } from "react";
import { type WorkflowNode, type WorkflowDefinition, type LogEntry } from "@shared/schema";
import { WorkflowCanvas } from "@/components/WorkflowCanvas";
import { MetadataPanel } from "@/components/MetadataPanel";
import { LegendPanel } from "@/components/LegendPanel";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import { WorkflowStepList } from "@/components/WorkflowStepList";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Info, PanelRightClose, PanelRightOpen, Filter, List, ListCollapse } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type PhaseFilter = 'all' | 'ui' | 'exchange';

export default function WorkflowVisualization() {
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | undefined>();
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isStepListOpen, setIsStepListOpen] = useState(true);
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>('all');

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

  const filteredNodes = workflowData?.nodes.filter(node => {
    if (phaseFilter === 'all') return true;
    if (phaseFilter === 'ui') {
      return node.script === 'ui' || node.type === 'start' || node.type === 'end';
    }
    if (phaseFilter === 'exchange') {
      return node.script === 'exchange' || node.type === 'start' || node.type === 'end';
    }
    return true;
  }) || [];

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
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">
              SWMM5 to ICM SWMM Workflow Visualizer
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              ICM InfoWorks Batch Import Process
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Show:</span>
              <ToggleGroup type="single" value={phaseFilter} onValueChange={(value) => value && setPhaseFilter(value as PhaseFilter)} data-testid="group-phase-filter">
                <ToggleGroupItem value="all" className="text-xs px-3" data-testid="toggle-filter-all">
                  All
                </ToggleGroupItem>
                <ToggleGroupItem value="ui" className="text-xs px-3" data-testid="toggle-filter-ui">
                  UI Script
                </ToggleGroupItem>
                <ToggleGroupItem value="exchange" className="text-xs px-3" data-testid="toggle-filter-exchange">
                  Exchange Script
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
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

      <div className="flex-1 flex overflow-hidden">
        {isStepListOpen && (
          <div className="w-[320px] flex-shrink-0">
            <WorkflowStepList
              nodes={filteredNodes}
              selectedNodeId={selectedNode?.id}
              onNodeSelect={setSelectedNode}
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <WorkflowCanvas
            nodes={filteredNodes}
            edges={filteredEdges}
            onNodeSelect={setSelectedNode}
            selectedNodeId={selectedNode?.id}
          />
        </div>

        {isPanelOpen && (
          <div className="w-[400px] flex-shrink-0">
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
