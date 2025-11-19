import { type WorkflowNode } from "@shared/schema";
import { CheckCircle2, XCircle, AlertTriangle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowNodeProps {
  node: WorkflowNode;
  isSelected?: boolean;
  onClick?: () => void;
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
    const baseStyle = "absolute transition-all duration-100 cursor-pointer font-sans text-sm";
    const selectedStyle = isSelected ? "ring-2 ring-primary ring-offset-2" : "";
    
    switch (node.type) {
      case 'start':
      case 'end':
        return cn(
          baseStyle,
          selectedStyle,
          "rounded-full bg-card border-2 border-primary flex items-center justify-center px-6 py-3 min-w-[140px] hover-elevate"
        );
      case 'process':
        return cn(
          baseStyle,
          selectedStyle,
          "rounded-md bg-card border-2 border-card-border flex items-center justify-center px-5 py-4 min-w-[180px] min-h-[60px] hover-elevate",
          node.script === 'ui' && "border-primary/60",
          node.script === 'exchange' && "border-secondary/60"
        );
      case 'decision':
        return cn(
          baseStyle,
          selectedStyle,
          "bg-card border-2 border-warning/60 flex items-center justify-center px-6 py-5 min-w-[150px] min-h-[90px] hover-elevate",
          "transform rotate-45"
        );
      case 'data':
        return cn(
          baseStyle,
          selectedStyle,
          "bg-card border-2 border-muted-foreground/30 px-5 py-3 min-w-[160px] hover-elevate",
          "clip-path-parallelogram"
        );
      default:
        return cn(baseStyle, selectedStyle, "bg-card border border-border rounded-md px-4 py-3");
    }
  };

  return (
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
          <div className="font-medium text-center text-xs leading-tight">{node.label}</div>
          {node.status && <div className="mt-1">{getStatusIcon()}</div>}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-2">
            {node.status && getStatusIcon()}
            <span className={cn(
              "font-medium text-center leading-tight",
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
}
