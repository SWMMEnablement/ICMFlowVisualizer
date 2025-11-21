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
  
  // Find all method definitions by looking for 'def method_name' pattern
  const methods: Array<{ name: string; lineStart: number; lineEnd: number }> = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^\s*def\s+(\w+)/);
    
    if (match) {
      const methodName = match[1];
      
      // Skip helper methods
      if (methodName === 'initialize' || methodName.startsWith('_')) continue;
      if (['new', 'class', 'module'].includes(methodName)) continue;
      
      // Find end of method by looking for next 'def' or 'end' at same/lower indentation
      let lineEnd = i;
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j];
        // Stop at next method definition or final 'end'
        if (nextLine.match(/^\s*def\s+\w+/) || (j === lines.length - 1 && nextLine.trim() === 'end')) {
          lineEnd = j - 1;
          break;
        }
        // Also stop if we find a line starting with 'end' at same indentation as 'def'
        if (nextLine.match(/^\s*end\s*$/) && nextLine.match(/^def/) === null) {
          lineEnd = j;
          break;
        }
        lineEnd = j;
      }
      
      methods.push({ name: methodName, lineStart: i, lineEnd });
    }
  }
  
  // Create nodes for each method
  for (const method of methods) {
    nodeCount++;
    const nodeId = `step_${nodeCount}`;
    
    // Convert method name to readable title
    const title = method.name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Get code snippet
    const codeLines = lines.slice(method.lineStart, Math.min(method.lineEnd + 1, method.lineStart + 20));
    const codeSnippet = codeLines.join('\n');
    
    nodes.push({
      id: nodeId,
      type: 'process',
      label: title,
      description: `Method: ${method.name}`,
      position: { x: 300, y: 100 + nodeCount * 200 },
      metadata: {
        methodName: method.name,
        codeSnippet: codeSnippet.substring(0, 500)
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
