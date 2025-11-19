import { type WorkflowNode } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowStepListProps {
  nodes: WorkflowNode[];
  selectedNodeId?: string;
  onNodeSelect: (node: WorkflowNode) => void;
}

export function WorkflowStepList({ nodes, selectedNodeId, onNodeSelect }: WorkflowStepListProps) {
  const uiNodes = nodes.filter(n => n.script === 'ui' || n.type === 'start');
  const exchangeNodes = nodes.filter(n => n.script === 'exchange' || (n.type === 'end' && !n.script));

  const renderNodeItem = (node: WorkflowNode, index: number) => {
    const isSelected = node.id === selectedNodeId;
    
    return (
      <Button
        key={node.id}
        variant="ghost"
        className={cn(
          "w-full justify-start text-left h-auto py-3 px-3 hover-elevate",
          isSelected && "bg-accent"
        )}
        onClick={() => onNodeSelect(node)}
        data-testid={`step-item-${node.id}`}
      >
        <div className="flex items-start gap-3 w-full">
          <div className={cn(
            "shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5",
            isSelected 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          )}>
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm leading-tight mb-1">
              {node.label}
            </div>
            {node.description && (
              <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {node.description}
              </div>
            )}
          </div>
          {isSelected && (
            <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-1" />
          )}
        </div>
      </Button>
    );
  };

  return (
    <div className="h-full bg-card border-r border-border flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-sm">Workflow Steps</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {nodes.length} total steps
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-6">
          {uiNodes.length > 0 && (
            <div>
              <div className="px-2 mb-2">
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                  UI Script Phase
                </Badge>
              </div>
              <div className="space-y-1">
                {uiNodes.map((node, idx) => renderNodeItem(node, idx))}
              </div>
            </div>
          )}

          {exchangeNodes.length > 0 && (
            <div>
              <div className="px-2 mb-2 flex items-center gap-2">
                <Badge className="bg-secondary/10 text-secondary border-secondary/20 text-xs">
                  Exchange Script Phase
                </Badge>
                <Circle className="w-1 h-1 fill-muted-foreground text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Headless</span>
              </div>
              <div className="space-y-1">
                {exchangeNodes.map((node, idx) => renderNodeItem(node, uiNodes.length + idx))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
