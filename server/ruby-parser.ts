import { type WorkflowDefinition, type WorkflowNode, type WorkflowEdge } from "@shared/schema";

// Simple Ruby parser that extracts workflow structure from comments and method definitions
export function parseRubyFile(rubyCode: string): WorkflowDefinition {
  const lines = rubyCode.split('\n');
  const nodes: WorkflowNode[] = [];
  const edges: WorkflowEdge[] = [];
  
  let nodeCount = 0;
  let previousNodeId: string | null = null;
  
  // Add start node
  nodes.push({
    id: 'start',
    type: 'start',
    label: 'Start',
    position: { x: 300, y: 100 }
  });
  previousNodeId = 'start';
  
  // Extract all method definitions from Ruby code
  const methodMatches = rubyCode.matchAll(/def\s+(\w+)[^d]*?(?=\n\s*(?:def|end\s*$))/gm);
  
  for (const match of methodMatches) {
    const methodName = match[1];
    const fullMethodText = match[0];
    
    // Skip helper methods like initialize, private methods
    if (methodName === 'initialize' || methodName.startsWith('_')) continue;
    
    // Skip common Ruby keywords
    if (['new', 'class', 'module'].includes(methodName)) continue;
    
    nodeCount++;
    const nodeId = `step_${nodeCount}`;
    
    // Convert method name to readable title (e.g., parse_config -> Parse Config)
    const title = methodName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    nodes.push({
      id: nodeId,
      type: 'process',
      label: title,
      description: `Method: ${methodName}`,
      position: { x: 300, y: 100 + nodeCount * 200 },
      metadata: {
        methodName: methodName,
        codeSnippet: fullMethodText.substring(0, 500)
      }
    });
    
    if (previousNodeId) {
      edges.push({
        id: `e${nodeCount}`,
        source: previousNodeId,
        target: nodeId,
        type: 'primary'
      });
    }
    previousNodeId = nodeId;
  }
  
  // If no methods found, create a default process node
  if (nodeCount === 0) {
    nodeCount++;
    const nodeId = `step_${nodeCount}`;
    nodes.push({
      id: nodeId,
      type: 'process',
      label: 'Process Ruby Code',
      description: 'Ruby code processing',
      position: { x: 300, y: 300 },
      metadata: {
        codeSnippet: rubyCode.substring(0, 500)
      }
    });
    previousNodeId = nodeId;
  }
  
  // Add end node
  nodes.push({
    id: 'end',
    type: 'end',
    label: 'End',
    position: { x: 300, y: 100 + (nodeCount + 1) * 200 }
  });
  
  if (previousNodeId && previousNodeId !== 'end') {
    edges.push({
      id: `e_final`,
      source: previousNodeId,
      target: 'end',
      type: 'primary'
    });
  }
  
  return {
    nodes,
    edges,
    statistics: {
      filesProcessed: 0,
      filesSuccessful: 0,
      filesFailed: 0,
      totalNodes: nodeCount,
      totalLinks: 0,
      totalSubcatchments: 0,
      totalLabelListsDeleted: 0,
      failedFiles: []
    }
  };
}

export function workflowToMarkdown(workflow: WorkflowDefinition): string {
  const lines: string[] = [];
  
  lines.push('# Ruby Workflow Documentation\n');
  lines.push(`Generated on: ${new Date().toISOString()}\n`);
  
  lines.push('## Workflow Steps\n');
  
  const processNodes = workflow.nodes.filter(n => n.type === 'process');
  
  processNodes.forEach((node, index) => {
    lines.push(`### Step ${index + 1}: ${node.label}\n`);
    
    if (node.description) {
      lines.push(`${node.description}\n`);
    }
    
    if (node.metadata?.methodName) {
      lines.push(`**Method:** \`${node.metadata.methodName}\`\n`);
    }
    
    if (node.metadata?.codeSnippet) {
      lines.push('```ruby');
      lines.push(node.metadata.codeSnippet);
      lines.push('```\n');
    }
  });
  
  return lines.join('\n');
}
