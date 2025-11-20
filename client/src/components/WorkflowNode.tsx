import { type WorkflowNode } from "@shared/schema";
import { CheckCircle2, XCircle, AlertTriangle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WorkflowNodeProps {
  node: WorkflowNode;
  isSelected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export function WorkflowNodeComponent({ node, isSelected, onClick }: WorkflowNodeProps) {
  const getStatusIcon = () => {
    switch (node.status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-secondary" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'processing':
        return <Circle className="w-4 h-4 text-primary animate-pulse" />;
      default:
        return null;
    }
  };

  const getNodeStyle = () => {
    const baseStyle = "absolute transition-all duration-200 cursor-pointer font-sans text-base";
    const selectedStyle = isSelected ? "ring-4 ring-primary ring-offset-4 ring-offset-background shadow-lg shadow-primary/20 scale-105" : "";
    
    switch (node.type) {
      case 'start':
      case 'end':
        return cn(
          baseStyle,
          selectedStyle,
          "rounded-full bg-card border-2 border-primary flex items-center justify-center px-7 py-4 min-w-[160px] hover-elevate"
        );
      case 'process':
        return cn(
          baseStyle,
          selectedStyle,
          "rounded-md bg-card border-2 border-card-border flex items-center justify-center px-6 py-5 min-w-[200px] min-h-[70px] hover-elevate",
          node.script === 'ui' && "border-primary/60",
          node.script === 'exchange' && "border-secondary/60"
        );
      case 'decision':
        return cn(
          baseStyle,
          selectedStyle,
          "bg-card border-2 border-warning/60 flex items-center justify-center px-7 py-6 min-w-[170px] min-h-[100px] hover-elevate",
          "transform rotate-45"
        );
      case 'data':
        return cn(
          baseStyle,
          selectedStyle,
          "bg-card border-2 border-muted-foreground/30 px-6 py-4 min-w-[180px] hover-elevate",
          "clip-path-parallelogram"
        );
      default:
        return cn(baseStyle, selectedStyle, "bg-card border border-border rounded-md px-5 py-4");
    }
  };

  const nodeContent = (
    <div
      className={getNodeStyle()}
      style={{
        left: `${node.position.x}px`,
        top: `${node.position.y}px`,
      }}
      onClick={onClick}
      data-testid={`node-${node.id}`}
    >
      {node.type === 'decision' ? (
        <div className="transform -rotate-45 flex flex-col items-center gap-1">
          <div className="font-semibold text-center text-sm leading-tight">{node.label}</div>
          {node.status && <div className="mt-1">{getStatusIcon()}</div>}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            {node.status && getStatusIcon()}
            <span className={cn(
              "font-semibold text-center leading-tight",
              node.type === 'start' || node.type === 'end' ? "text-primary" : ""
            )}>{node.label}</span>
          </div>
          {node.script && (
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full font-mono",
              node.script === 'ui' ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
            )}>
              {node.script === 'ui' ? 'UI Script' : 'Exchange Script'}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (node.description) {
    return (
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          {nodeContent}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs" data-testid={`tooltip-${node.id}`}>
          <p className="text-sm">{node.description}</p>
          {node.metadata?.methodName && (
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              {node.metadata.methodName}()
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return nodeContent;
}
