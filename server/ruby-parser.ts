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
  
  const stepHeaders = rubyCode.match(/# ={5,}[\s\S]*?# (STEP \d+:.*?)[\s\n]# ={5,}/g) || [];
  
  stepHeaders.forEach((stepBlock, index) => {
    const titleMatch = stepBlock.match(/# STEP \d+:\s*(.*?)\n/);
    const title = titleMatch ? titleMatch[1].trim() : `Step ${index + 1}`;
    
    const methodMatch = stepBlock.match(/def\s+(\w+)/);
    const methodName = methodMatch ? methodMatch[1] : null;
    
    const codeMatch = stepBlock.match(/# ={5,}\n([\s\S]*?)(?:# ={5,}|$)/);
    const codeSnippet = codeMatch ? codeMatch[1].trim() : stepBlock.trim();
    
    nodeCount++;
    const nodeId = `step_${nodeCount}`;
    
    nodes.push({
      id: nodeId,
      type: 'process',
      label: title,
      description: `Ruby code block for ${title}`,
      position: { x: 300, y: 100 + nodeCount * 200 },
      metadata: {
        methodName: methodName || undefined,
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
  });
  
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
