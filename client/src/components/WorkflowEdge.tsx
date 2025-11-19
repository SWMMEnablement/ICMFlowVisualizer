import { type WorkflowEdge, type WorkflowNode } from "@shared/schema";

interface WorkflowEdgeProps {
  edge: WorkflowEdge;
  nodes: WorkflowNode[];
  isHighlighted?: boolean;
}

export function WorkflowEdgeComponent({ edge, nodes, isHighlighted }: WorkflowEdgeProps) {
  const sourceNode = nodes.find(n => n.id === edge.source);
  const targetNode = nodes.find(n => n.id === edge.target);

  if (!sourceNode || !targetNode) return null;

  const startX = sourceNode.position.x + 90;
  const startY = sourceNode.position.y + 30;
  const endX = targetNode.position.x + 90;
  const endY = targetNode.position.y + 30;

  const midY = (startY + endY) / 2;

  const strokeWidth = isHighlighted ? 3 : (edge.type === 'primary' ? 2 : 1);
  const strokeDasharray = edge.type === 'conditional' ? "4,4" : "0";
  const stroke = isHighlighted
    ? "hsl(var(--ring))"
    : edge.type === 'primary' 
    ? "hsl(var(--primary))" 
    : edge.type === 'conditional'
    ? "hsl(var(--warning))"
    : "hsl(var(--muted-foreground))";
  const opacity = isHighlighted ? 1 : 0.7;

  const path = `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;

  return (
    <g data-testid={`edge-${edge.id}`}>
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        opacity={opacity}
        markerEnd={isHighlighted ? "url(#arrowhead-highlighted)" : "url(#arrowhead)"}
        className="transition-all duration-200"
      />
      {edge.label && (
        <text
          x={(startX + endX) / 2}
          y={midY - 8}
          fill="hsl(var(--muted-foreground))"
          fontSize="11"
          fontFamily="Roboto"
          textAnchor="middle"
        >
          {edge.label}
        </text>
      )}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="8"
          refX="8"
          refY="4"
          orient="auto"
        >
          <polygon
            points="0 0, 8 4, 0 8"
            fill="hsl(var(--primary))"
            opacity="0.7"
          />
        </marker>
        <marker
          id="arrowhead-highlighted"
          markerWidth="8"
          markerHeight="8"
          refX="8"
          refY="4"
          orient="auto"
        >
          <polygon
            points="0 0, 8 4, 0 8"
            fill="hsl(var(--ring))"
          />
        </marker>
      </defs>
    </g>
  );
}
