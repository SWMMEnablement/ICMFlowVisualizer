import { useState, useRef, useCallback } from "react";
import { type WorkflowNode, type WorkflowEdge } from "@shared/schema";
import { WorkflowNodeComponent } from "./WorkflowNode";
import { WorkflowEdgeComponent } from "./WorkflowEdge";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onNodeSelect?: (node: WorkflowNode) => void;
  selectedNodeId?: string;
}

export function WorkflowCanvas({ nodes, edges, onNodeSelect, selectedNodeId }: WorkflowCanvasProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setZoom(prev => Math.max(0.5, Math.min(2, prev + delta)));
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-background">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          size="icon"
          variant="secondary"
          onClick={handleZoomIn}
          data-testid="button-zoom-in"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={handleZoomOut}
          data-testid="button-zoom-out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={handleReset}
          data-testid="button-reset-view"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      <div
        ref={canvasRef}
        className={cn(
          "w-full h-full",
          isPanning ? "cursor-grabbing" : "cursor-grab"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        data-testid="workflow-canvas"
      >
        <div
          className="relative transition-transform duration-100"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: '3000px',
            height: '2000px'
          }}
        >
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: '100%', height: '100%' }}
          >
            {edges.map(edge => {
              const isHighlighted = selectedNodeId && (
                edge.source === selectedNodeId || edge.target === selectedNodeId
              );
              return (
                <WorkflowEdgeComponent
                  key={edge.id}
                  edge={edge}
                  nodes={nodes}
                  isHighlighted={isHighlighted}
                />
              );
            })}
          </svg>

          {nodes.map(node => (
            <WorkflowNodeComponent
              key={node.id}
              node={node}
              isSelected={node.id === selectedNodeId}
              onClick={(e) => {
                e.stopPropagation();
                onNodeSelect?.(node);
              }}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 bg-card border border-border rounded-md px-3 py-2 text-xs font-mono">
        Zoom: {(zoom * 100).toFixed(0)}%
      </div>
    </div>
  );
}
