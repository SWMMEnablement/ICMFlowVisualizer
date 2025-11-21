import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Diamond, FileText, Square, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function OnboardingDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("icm-ruby-workflow-onboarding-seen");
    if (!hasSeenOnboarding) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("icm-ruby-workflow-onboarding-seen", "true");
    setOpen(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      handleClose();
    } else {
      setOpen(isOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-onboarding">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading">ICM Ruby Workflow</DialogTitle>
          <DialogDescription className="text-base">
            Interactive analyzer for Ruby scripts that process ICM InfoWorks workflows and data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
              Getting Started
            </h3>
            <ul className="ml-8 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <span><span className="font-semibold text-foreground">Click the upload button</span> (top of screen) to select a Ruby (.rb) file</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <span><span className="font-semibold text-foreground">The analyzer</span> will automatically parse your code and generate insights</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <span><span className="font-semibold text-foreground">Browse the tabs</span> to explore different analysis perspectives</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
              Analysis Tabs
            </h3>
            <div className="space-y-3 ml-8 text-sm">
              <div>
                <div className="font-semibold text-foreground">Analysis</div>
                <p className="text-muted-foreground">Classes, methods, and code structure detected in your Ruby file</p>
              </div>
              <div>
                <div className="font-semibold text-foreground">Overview</div>
                <p className="text-muted-foreground">AI-powered summary explaining what the script does</p>
              </div>
              <div>
                <div className="font-semibold text-foreground">Nano Banana</div>
                <p className="text-muted-foreground">Structured breakdown using the Nano Banana prompt framework for detailed explanations</p>
              </div>
              <div>
                <div className="font-semibold text-foreground">Diagram</div>
                <p className="text-muted-foreground">ASCII flowchart showing code structure: API calls, methods, data processing, control flow, and error handling</p>
              </div>
              <div>
                <div className="font-semibold text-foreground">Stats</div>
                <p className="text-muted-foreground">Code statistics and metrics</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
              Reference Documentation
            </h3>
            <p className="ml-8 text-sm text-muted-foreground">
              Click the <span className="font-semibold text-foreground">Reference</span> button in the header to access comprehensive Ruby documentation for ICM InfoWorks, including database table names, API patterns, glossary terms, and code examples.
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <p className="text-sm text-muted-foreground flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
              <span>
                <span className="font-semibold text-foreground">Tip:</span> Use the ASCII Diagram tab to quickly visualize your script's execution flow, 
                and the Overview tab for a quick understanding of what your code does.
              </span>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} className="w-full" data-testid="button-close-onboarding">
            Ready to analyze Ruby code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
