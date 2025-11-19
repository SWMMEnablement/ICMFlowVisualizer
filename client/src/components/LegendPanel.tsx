import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Circle, Square, Diamond, FileText, CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";

export function LegendPanel() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base font-serif">Workflow Legend</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        <div>
          <h4 className="font-semibold mb-2 text-muted-foreground">Node Types</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-primary fill-primary" />
              <span>Start/End Terminal</span>
            </div>
            <div className="flex items-center gap-2">
              <Square className="w-4 h-4 text-primary" />
              <span>Process Step</span>
            </div>
            <div className="flex items-center gap-2">
              <Diamond className="w-4 h-4 text-warning" />
              <span>Decision Point</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span>Data/File</span>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold mb-2 text-muted-foreground">Script Context</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-16 h-1 bg-primary rounded" />
              <span>UI Script Phase</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1 bg-secondary rounded" />
              <span>Exchange Script Phase</span>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold mb-2 text-muted-foreground">Status Indicators</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-secondary" />
              <span>Success</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-destructive" />
              <span>Error</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span>Warning</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary animate-pulse" />
              <span>Processing</span>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold mb-2 text-muted-foreground">Key Concepts</h4>
          <div className="space-y-2 text-muted-foreground">
            <div>
              <span className="font-semibold text-foreground">Environment Variables:</span> Post-it notes left by the UI script for the Exchange script to read
            </div>
            <div>
              <span className="font-semibold text-foreground">Headless Execution:</span> Exchange script runs invisibly in the background via ICMExchange.exe
            </div>
            <div>
              <span className="font-semibold text-foreground">Error Handling:</span> Begin/Rescue blocks prevent single file failures from stopping the entire batch
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
