import { type WorkflowNode, type FileConfig, type ImportStatistics, type LogEntry } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Activity, BarChart3, Terminal, CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import mermaid from "mermaid";

interface MetadataPanelProps {
  selectedNode?: WorkflowNode;
  rubyCode?: string;
  fileName?: string;
  fileConfigs?: FileConfig[];
  statistics?: ImportStatistics;
  logs?: LogEntry[];
  logsLoading?: boolean;
  logsError?: Error | null;
}

function analyzeRubyCode(code: string): { methods: string[]; classes: string[]; summary: string } {
  const methods: string[] = [];
  const classes: string[] = [];
  
  // Find all method definitions
  const methodMatches = code.matchAll(/^\s*def\s+(\w+)/gm);
  for (const match of methodMatches) {
    const methodName = match[1];
    if (methodName !== 'initialize' && !methodName.startsWith('_')) {
      methods.push(methodName);
    }
  }
  
  // Find all class definitions
  const classMatches = code.matchAll(/^\s*class\s+(\w+)/gm);
  for (const match of classMatches) {
    classes.push(match[1]);
  }
  
  // Generate summary
  let summary = 'This Ruby script ';
  
  if (classes.length > 0) {
    summary += `defines ${classes.length} class${classes.length > 1 ? 'es' : ''} (${classes.join(', ')}) and `;
  }
  
  if (methods.length > 0) {
    summary += `contains ${methods.length} method${methods.length > 1 ? 's' : ''} that handle various operations.`;
  } else {
    summary += 'processes Ruby code logic.';
  }
  
  return { methods, classes, summary };
}

export function MetadataPanel({ selectedNode, rubyCode = '', fileName = '', fileConfigs = [], statistics, logs = [], logsLoading, logsError }: MetadataPanelProps) {
  const [aiOverview, setAiOverview] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [mermaidDiagram, setMermaidDiagram] = useState<string>('');
  const [mermaidLoading, setMermaidLoading] = useState(false);
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [nanoExplanation, setNanoExplanation] = useState<string>('');
  const [nanoLoading, setNanoLoading] = useState(false);

  useEffect(() => {
    if (rubyCode && rubyCode.trim()) {
      setAiLoading(true);
      setAiOverview('');
      
      // Call the AI endpoint to get detailed overview
      fetch('/api/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: rubyCode, context: 'detailed overview' })
      })
        .then(res => res.json())
        .then(data => {
          setAiOverview(data.analysis || '');
          setAiLoading(false);
        })
        .catch(error => {
          console.error('Error fetching AI analysis:', error);
          setAiLoading(false);
        });
    }
  }, [rubyCode]);

  useEffect(() => {
    if (rubyCode && rubyCode.trim()) {
      setMermaidLoading(true);
      setMermaidDiagram('');
      
      // Call the mermaid diagram endpoint
      fetch('/api/mermaid-diagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: rubyCode })
      })
        .then(res => res.json())
        .then(data => {
          setMermaidDiagram(data.diagram || '');
          setMermaidLoading(false);
        })
        .catch(error => {
          console.error('Error fetching mermaid diagram:', error);
          setMermaidLoading(false);
        });
    }
  }, [rubyCode]);

  useEffect(() => {
    if (mermaidDiagram && mermaidRef.current) {
      // ASCII diagram - display as monospace pre-formatted text
      mermaidRef.current.innerHTML = `<pre style="font-family: monospace; font-size: 13px; white-space: pre-wrap; overflow: auto; margin: 0;">${mermaidDiagram.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
    }
  }, [mermaidDiagram]);

  useEffect(() => {
    if (rubyCode && rubyCode.trim()) {
      setNanoLoading(true);
      setNanoExplanation('');
      
      fetch('/api/nano-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: rubyCode })
      })
        .then(res => res.json())
        .then(data => {
          setNanoExplanation(data.explanation || '');
          setNanoLoading(false);
        })
        .catch(error => {
          console.error('Error fetching nano explanation:', error);
          setNanoLoading(false);
        });
    }
  }, [rubyCode]);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-secondary text-secondary-foreground"><CheckCircle2 className="w-3 h-3 mr-1" />Success</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Error</Badge>;
      case 'warning':
        return <Badge className="bg-warning text-warning-foreground"><AlertTriangle className="w-3 h-3 mr-1" />Warning</Badge>;
      case 'processing':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1 animate-pulse" />Processing</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const analysis = rubyCode ? analyzeRubyCode(rubyCode) : null;

  return (
    <div className="h-full bg-card border-l border-border">
      <Tabs defaultValue={rubyCode ? "analysis" : "overview"} className="h-full flex flex-col">
        <div className="border-b border-border px-4 py-3">
          <TabsList className="grid w-full grid-cols-5 gap-1">
            {rubyCode && (
              <TabsTrigger value="analysis" className="text-xs" data-testid="tab-analysis">
                <Activity className="w-3 h-3 mr-1" />
                Analysis
              </TabsTrigger>
            )}
            <TabsTrigger value="overview" className="text-xs" data-testid="tab-overview">
              <Activity className="w-3 h-3 mr-1" />
              Overview
            </TabsTrigger>
            {rubyCode && (
              <TabsTrigger value="nano" className="text-xs" data-testid="tab-nano">
                <Terminal className="w-3 h-3 mr-1" />
                Nano Banana
              </TabsTrigger>
            )}
            {rubyCode && (
              <TabsTrigger value="mermaid" className="text-xs" data-testid="tab-mermaid">
                <BarChart3 className="w-3 h-3 mr-1" />
                Diagram
              </TabsTrigger>
            )}
            <TabsTrigger value="statistics" className="text-xs" data-testid="tab-statistics">
              <BarChart3 className="w-3 h-3 mr-1" />
              Stats
            </TabsTrigger>
            {!rubyCode && (
              <TabsTrigger value="logs" className="text-xs" data-testid="tab-logs">
                <Terminal className="w-3 h-3 mr-1" />
                Logs
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          {rubyCode && analysis && (
            <TabsContent value="analysis" className="h-full m-0 p-4" data-testid="panel-analysis">
              <ScrollArea className="h-full">
                <div className="space-y-4 pr-4">
                  {fileName && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          File
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs font-mono text-foreground">{fileName}</p>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">{analysis.summary}</p>
                    </CardContent>
                  </Card>

                  {analysis.classes.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Terminal className="w-4 h-4" />
                          Classes Defined
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {analysis.classes.map((cls) => (
                            <div key={cls} className="bg-muted/30 rounded px-3 py-2 font-mono text-xs text-foreground">
                              {cls}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {analysis.methods.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Terminal className="w-4 h-4" />
                          Methods ({analysis.methods.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {analysis.methods.map((method) => (
                            <div key={method} className="bg-muted/30 rounded px-3 py-2 font-mono text-xs text-foreground">
                              {method}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Key Details</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground space-y-2">
                      <p>• <span className="font-semibold text-foreground">{analysis.methods.length}</span> method{analysis.methods.length !== 1 ? 's' : ''} defined</p>
                      <p>• <span className="font-semibold text-foreground">{analysis.classes.length}</span> class{analysis.classes.length !== 1 ? 'es' : ''} defined</p>
                      <p>• Script total size: <span className="font-semibold text-foreground">{rubyCode.length}</span> characters</p>
                      <p>• Lines of code: <span className="font-semibold text-foreground">{rubyCode.split('\n').length}</span></p>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          )}

          <TabsContent value="overview" className="h-full m-0 p-4" data-testid="panel-overview">
            <ScrollArea className="h-full">
              {rubyCode ? (
                <div className="space-y-4 pr-4">
                  {aiLoading ? (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-center space-y-2 py-8">
                          <div className="text-center space-y-2">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-sm text-muted-foreground">Analyzing code with AI...</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : aiOverview ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Code Overview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-primary font-bold leading-relaxed whitespace-pre-wrap">{aiOverview}</p>
                      </CardContent>
                    </Card>
                  ) : null}
                </div>
              ) : selectedNode ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-serif font-semibold text-lg mb-2">{selectedNode.label}</h3>
                    {selectedNode.status && (
                      <div className="mb-3">{getStatusBadge(selectedNode.status)}</div>
                    )}
                    {selectedNode.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{selectedNode.description}</p>
                    )}
                  </div>

                  {selectedNode.metadata?.methodName && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Terminal className="w-4 h-4" />
                          Method Name
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted/30 rounded px-3 py-2 font-mono text-xs text-foreground">
                          {selectedNode.metadata.methodName}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedNode.metadata?.codeSnippet && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Terminal className="w-4 h-4" />
                          Ruby Code
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted/30 rounded p-3 overflow-x-auto">
                          <pre className="font-mono text-xs text-foreground whitespace-pre">{selectedNode.metadata.codeSnippet}</pre>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedNode.script && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Script Context</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">
                          This step runs in the <span className="font-mono font-semibold text-foreground">{selectedNode.script === 'ui' ? 'SWMM5_Import_UI_Annotated.rb' : 'SWMM5_Import_Exchange_Annotated.rb'}</span> script.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground text-sm space-y-2">
                  <p>No workflow node selected</p>
                  {!rubyCode && <p className="text-xs">Upload a Ruby file to get started</p>}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {rubyCode && (
            <TabsContent value="nano" className="h-full m-0 p-4" data-testid="panel-nano">
              <ScrollArea className="h-full">
                {nanoLoading ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-center space-y-2 py-8">
                        <div className="text-center space-y-2">
                          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                          <p className="text-sm text-muted-foreground">Explaining code...</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : nanoExplanation ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Code Explanation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{nanoExplanation}</p>
                    </CardContent>
                  </Card>
                ) : null}
              </ScrollArea>
            </TabsContent>
          )}

          {rubyCode && (
            <TabsContent value="mermaid" className="h-full m-0 p-4" data-testid="panel-mermaid">
              <ScrollArea className="h-full">
                {mermaidLoading ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-center space-y-2 py-8">
                        <div className="text-center space-y-2">
                          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                          <p className="text-sm text-muted-foreground">Generating diagram...</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : mermaidDiagram ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Code Structure Diagram</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div ref={mermaidRef} className="w-full overflow-auto bg-muted/20 rounded p-4 font-mono text-sm" />
                    </CardContent>
                  </Card>
                ) : null}
              </ScrollArea>
            </TabsContent>
          )}

          <TabsContent value="statistics" className="h-full m-0 p-4" data-testid="panel-statistics">
            <ScrollArea className="h-full">
              {statistics ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary">{statistics.filesProcessed}</div>
                          <div className="text-xs text-muted-foreground mt-1">Files Processed</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-secondary">{statistics.filesSuccessful}</div>
                          <div className="text-xs text-muted-foreground mt-1">Successful</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-destructive">{statistics.filesFailed}</div>
                          <div className="text-xs text-muted-foreground mt-1">Failed</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold">{statistics.totalNodes}</div>
                          <div className="text-xs text-muted-foreground mt-1">Total Nodes</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Network Elements</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Links:</span>
                        <span className="font-mono font-semibold">{statistics.totalLinks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subcatchments:</span>
                        <span className="font-mono font-semibold">{statistics.totalSubcatchments}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Label Lists Deleted:</span>
                        <span className="font-mono font-semibold">{statistics.totalLabelListsDeleted}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {statistics.failedFiles.length > 0 && (
                    <Card className="border-destructive/50">
                      <CardHeader>
                        <CardTitle className="text-sm text-destructive">Failed Files</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {statistics.failedFiles.map((failed, idx) => (
                          <div key={idx} className="text-xs space-y-1">
                            <div className="font-mono font-semibold">{failed.file}</div>
                            <div className="text-muted-foreground">{failed.reason}</div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No statistics available
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="logs" className="h-full m-0 p-0" data-testid="panel-logs">
            <ScrollArea className="h-full">
              {logsLoading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm font-sans">
                  <div className="text-center space-y-2">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p>Loading logs...</p>
                  </div>
                </div>
              ) : logsError ? (
                <div className="flex items-center justify-center h-full p-4">
                  <div className="text-center space-y-2">
                    <p className="text-destructive text-sm font-sans">Error loading logs</p>
                    <p className="text-xs text-muted-foreground">{logsError.message}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 space-y-1 font-mono text-xs">
                  {logs.length > 0 ? (
                    logs.map((log, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "py-1.5 px-2 rounded",
                          log.level === 'ERROR' && "bg-destructive/10 text-destructive",
                          log.level === 'WARNING' && "bg-warning/10 text-warning-foreground",
                          log.level === 'SUCCESS' && "bg-secondary/10 text-secondary",
                          log.level === 'INFO' && "text-muted-foreground"
                        )}
                        data-testid={`log-entry-${idx}`}
                      >
                        <span className="opacity-60">[{log.timestamp}]</span>{' '}
                        <span className="font-semibold">{log.level}</span>:{' '}
                        {log.message}
                        {log.file && <span className="opacity-60"> ({log.file})</span>}
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm font-sans">
                      No logs available
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
