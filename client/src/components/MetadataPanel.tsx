import { type WorkflowNode, type FileConfig, type ImportStatistics, type LogEntry } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Activity, BarChart3, Terminal, CheckCircle2, XCircle, AlertTriangle, Clock, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import mermaid from "mermaid";

interface MetadataPanelProps {
  selectedNode?: WorkflowNode;
  rubyCode?: string;
  fileName?: string;
  fileType?: 'rb' | 'inp' | null;
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

function parseSWMM5File(content: string): { sections: string[]; elements: Map<string, number> } {
  const sections: string[] = [];
  const elements = new Map<string, number>();
  
  const lines = content.split('\n');
  let currentSection = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      currentSection = trimmed.slice(1, -1);
      sections.push(currentSection);
      elements.set(currentSection, 0);
    } else if (trimmed && currentSection && !trimmed.startsWith(';')) {
      elements.set(currentSection, (elements.get(currentSection) || 0) + 1);
    }
  }
  
  return { sections, elements };
}

export function MetadataPanel({ selectedNode, rubyCode = '', fileName = '', fileType = null, fileConfigs = [], statistics, logs = [], logsLoading, logsError }: MetadataPanelProps) {
  const [aiOverview, setAiOverview] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [mermaidDiagram, setMermaidDiagram] = useState<string>('');
  const [nanoExplanation, setNanoExplanation] = useState<string>('');
  const [nanoLoading, setNanoLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (fileType === 'rb' && rubyCode) return 'analysis';
    if (fileType === 'inp' && rubyCode) return 'statistics';
    return 'overview';
  });
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (fileType === 'rb' && rubyCode && activeTab === 'statistics') {
      setActiveTab('analysis');
    } else if (fileType === 'inp' && rubyCode && (activeTab === 'analysis' || activeTab === 'overview')) {
      setActiveTab('statistics');
    }
  }, [fileType, rubyCode]);

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
      setMermaidDiagram('');
      
      // Call the diagram endpoint
      fetch('/api/mermaid-diagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: rubyCode })
      })
        .then(res => res.json())
        .then(data => {
          setMermaidDiagram(data.diagram || '');
        })
        .catch(error => {
          console.error('Error fetching diagram:', error);
        });
    }
  }, [rubyCode]);

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

  const analysis = fileType === 'rb' && rubyCode ? analyzeRubyCode(rubyCode) : null;
  const swmm5Data = fileType === 'inp' && rubyCode ? parseSWMM5File(rubyCode) : null;

  const getContentToCopy = (): string => {
    switch (activeTab) {
      case 'analysis':
        if (!analysis) return '';
        let analysisText = '';
        if (fileName) analysisText += `File: ${fileName}\n\n`;
        analysisText += `Summary: ${analysis.summary}\n\n`;
        if (analysis.classes.length > 0) {
          analysisText += `Classes:\n${analysis.classes.join('\n')}\n\n`;
        }
        if (analysis.methods.length > 0) {
          analysisText += `Methods:\n${analysis.methods.join('\n')}\n`;
        }
        return analysisText;
      case 'overview':
        return aiOverview;
      case 'nano':
        return nanoExplanation;
      case 'mermaid':
        return mermaidDiagram;
      case 'statistics':
        if (!statistics) return '';
        return `Files Processed: ${statistics.filesProcessed}
Successful: ${statistics.filesSuccessful}
Failed: ${statistics.filesFailed}
Total Nodes: ${statistics.totalNodes}
Total Links: ${statistics.totalLinks}
Total Subcatchments: ${statistics.totalSubcatchments}
Label Lists Deleted: ${statistics.totalLabelListsDeleted}`;
      case 'logs':
        return logs.map(log => `[${log.timestamp}] ${log.level}: ${log.message}${log.file ? ` (${log.file})` : ''}`).join('\n');
      default:
        return '';
    }
  };

  const handleCopy = async () => {
    const text = getContentToCopy();
    if (text) {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="h-full bg-card border-l border-border">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="border-b border-border px-4 py-3 flex items-center justify-between">
          <TabsList className={`grid ${fileType === 'inp' ? 'grid-cols-4' : 'grid-cols-5'} gap-1`}>
            {rubyCode && fileType === 'rb' && (
              <TabsTrigger value="analysis" className="text-xs" data-testid="tab-analysis">
                <Activity className="w-3 h-3 mr-1" />
                Analysis
              </TabsTrigger>
            )}
            {rubyCode && (
            <TabsTrigger value="overview" className="text-xs" data-testid="tab-overview">
              <Activity className="w-3 h-3 mr-1" />
              Overview
            </TabsTrigger>
            )}
            {rubyCode && (
              <TabsTrigger value="nano" className="text-xs" data-testid="tab-nano">
                <Terminal className="w-3 h-3 mr-1" />
                Nano Banana
              </TabsTrigger>
            )}
            {rubyCode && fileType === 'rb' && (
              <TabsTrigger value="mermaid" className="text-xs" data-testid="tab-mermaid">
                <BarChart3 className="w-3 h-3 mr-1" />
                Diagram
              </TabsTrigger>
            )}
            {fileType === 'inp' && (
              <TabsTrigger value="statistics" className="text-xs" data-testid="tab-statistics">
                <BarChart3 className="w-3 h-3 mr-1" />
                Structure
              </TabsTrigger>
            )}
            {fileType === 'rb' && (
            <TabsTrigger value="statistics" className="text-xs" data-testid="tab-statistics">
              <BarChart3 className="w-3 h-3 mr-1" />
              Stats
            </TabsTrigger>
            )}
            {!rubyCode && (
              <TabsTrigger value="logs" className="text-xs" data-testid="tab-logs">
                <Terminal className="w-3 h-3 mr-1" />
                Logs
              </TabsTrigger>
            )}
          </TabsList>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                data-testid="button-copy-tab"
              >
                {isCopied ? (
                  <Check className="w-4 h-4 text-secondary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              {isCopied ? 'Copied!' : 'Copy tab content'}
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex-1 overflow-hidden">
          {rubyCode && fileType === 'rb' && analysis && (
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

          {(fileType === 'rb' || fileType === 'inp') && (
          <TabsContent value="overview" className="h-full m-0 p-4" data-testid="panel-overview">
            <ScrollArea className="h-full">
              {rubyCode && fileType ? (
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
          )}

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

          {rubyCode && fileType === 'rb' && (
            <TabsContent value="mermaid" className="h-full m-0 p-4" data-testid="panel-mermaid">
              <ScrollArea className="h-full">
                {mermaidDiagram ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Code Structure Diagram</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="w-full overflow-auto bg-muted/20 rounded p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words">
                        {mermaidDiagram}
                      </pre>
                    </CardContent>
                  </Card>
                ) : null}
              </ScrollArea>
            </TabsContent>
          )}

          {fileType === 'inp' && swmm5Data && (
            <TabsContent value="statistics" className="h-full m-0 p-4" data-testid="panel-inp-structure">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">File Structure</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground mb-3">Total sections: <span className="font-semibold text-foreground">{swmm5Data.sections.length}</span></p>
                      <div className="space-y-2">
                        {swmm5Data.sections.map((section) => (
                          <div key={section} className="flex justify-between items-center bg-muted/30 rounded px-3 py-2">
                            <span className="font-mono text-xs text-foreground">{section}</span>
                            <Badge variant="secondary" className="text-xs">{swmm5Data.elements.get(section) || 0}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          )}

          {fileType === 'rb' && (
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
          )}

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
