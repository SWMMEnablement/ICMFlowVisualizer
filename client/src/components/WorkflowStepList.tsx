import { type WorkflowNode } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
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
          "w-full justify-start text-left h-auto py-3 px-3 hover-elevate transition-all duration-200",
          isSelected && "bg-primary/10 border-l-4 border-primary shadow-md"
        )}
        onClick={() => onNodeSelect(node)}
        data-testid={`step-item-${node.id}`}
      >
        <div className="flex items-start gap-3 w-full">
          <div className={cn(
            "shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mt-0.5 transition-all duration-200",
            isSelected 
              ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2" 
              : "bg-muted text-muted-foreground"
          )}>
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className={cn(
              "leading-tight mb-1 transition-all duration-200",
              isSelected ? "font-semibold text-base text-primary" : "font-medium text-sm"
            )}>
              {node.label}
            </div>
            {node.description && (
              <div className={cn(
                "text-xs line-clamp-2 leading-relaxed",
                isSelected ? "text-foreground" : "text-muted-foreground"
              )}>
                {node.description}
              </div>
            )}
          </div>
          {isSelected && (
            <ChevronRight className="w-5 h-5 text-primary shrink-0 mt-1 animate-pulse" />
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
                  Ruby Script Phase
                </Badge>
              </div>
              <div className="space-y-1">
                {uiNodes.map((node, idx) => renderNodeItem(node, idx))}
              </div>
            </div>
          )}

          {exchangeNodes.length > 0 && (
            <div>
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
