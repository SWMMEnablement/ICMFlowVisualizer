import { useState, useEffect } from "react";
import { type WorkflowNode, type WorkflowDefinition, type LogEntry } from "@shared/schema";
import { WorkflowCanvas } from "@/components/WorkflowCanvas";
import { MetadataPanel } from "@/components/MetadataPanel";
import { LegendPanel } from "@/components/LegendPanel";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Info, PanelRightClose, PanelRightOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function WorkflowVisualization() {
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | undefined>();
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isLegendOpen, setIsLegendOpen] = useState(false);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">
              SWMM5 to ICM SWMM Workflow Visualizer
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              ICM InfoWorks Batch Import Process
            </p>
          </div>
          <div className="flex gap-2">
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
        <div className={isPanelOpen ? "flex-1" : "w-full"}>
          <WorkflowCanvas
            nodes={workflowData.nodes}
            edges={workflowData.edges}
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
