import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="dialog-about">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading">ICM Ruby to Nano Banana Prompt</DialogTitle>
          <DialogDescription className="text-base">
            Interactive analyzer for Ruby automation scripts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <h3 className="font-semibold text-lg mb-3">What is this?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ICM Ruby to Nano Banana Prompt is an interactive analyzer designed to help engineers quickly understand complex Ruby automation scripts used in ICM InfoWorks. The application parses Ruby files to automatically extract code structure, generate detailed ASCII diagrams showing execution flow and API calls, and provide AI-powered analysis. By combining static code parsing with intelligent insights, it transforms raw Ruby scripts into comprehensible documentation that engineers can explore through an intuitive, web-based interface.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">How it works</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              The app features a two-panel layout with the Ruby code viewer on the left and a tabbed analysis panel on the right offering multiple perspectives:
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="font-semibold text-foreground shrink-0">Analysis</span>
                <span>Classes, methods, and code structure detected in your Ruby file</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground shrink-0">Overview</span>
                <span>AI summary of what the script does</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground shrink-0">Nano Banana</span>
                <span>Structured breakdown using the Nano Banana prompt framework for detailed explanations</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground shrink-0">Diagram</span>
                <span>ASCII flowchart showing API calls, methods, data processing, control flow, and error handling</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground shrink-0">Stats</span>
                <span>Code metrics and statistics</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Getting started</h3>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Click "Open .rb File" to upload a Ruby script</li>
              <li>The analyzer automatically parses your code and generates insights</li>
              <li>Explore the different analysis tabs to understand your code from multiple perspectives</li>
              <li>Use the Reference button to access Ruby and ICM InfoWorks documentation</li>
            </ol>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Use case:</span> Perfect for engineers working with ICM InfoWorks Ruby scripts for batch imports, data processing, and system integration.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
