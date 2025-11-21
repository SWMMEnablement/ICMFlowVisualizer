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
              Two-Phase Process
            </h3>
            <div className="space-y-2 ml-8 text-sm">
              <div className="flex items-start gap-3">
                <Badge className="bg-primary/10 text-primary border-primary/20 shrink-0">UI Script</Badge>
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">SWMM5_Import_UI_Annotated.rb</span> - Runs in the ICM UI. 
                  User selects files, configures settings, and saves configuration to a YAML file.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="bg-secondary/10 text-secondary border-secondary/20 shrink-0">Exchange Script</Badge>
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">SWMM5_Import_Exchange_Annotated.rb</span> - Runs in headless mode via ICMExchange.exe. 
                  Reads the config and performs the actual database import operations.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
              Node Shapes & Meanings
            </h3>
            <div className="grid grid-cols-2 gap-3 ml-8 text-sm">
              <div className="flex items-center gap-3">
                <Circle className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <div className="font-semibold">Circle</div>
                  <div className="text-xs text-muted-foreground">Start/End points</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Square className="w-5 h-5 text-secondary shrink-0" />
                <div>
                  <div className="font-semibold">Rectangle</div>
                  <div className="text-xs text-muted-foreground">Process steps</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Diamond className="w-5 h-5 text-warning shrink-0" />
                <div>
                  <div className="font-semibold">Diamond</div>
                  <div className="text-xs text-muted-foreground">Decision points</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                <div>
                  <div className="font-semibold">Document</div>
                  <div className="text-xs text-muted-foreground">Data/files</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
              How to Use This Diagram
            </h3>
            <ul className="ml-8 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <span><span className="font-semibold text-foreground">Click any node</span> to see Ruby code, method names, and detailed descriptions</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <span><span className="font-semibold text-foreground">Pan & zoom</span> by dragging the canvas and using your mouse wheel</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <span><span className="font-semibold text-foreground">Follow the arrows</span> to trace the execution flow from start to end</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <span><span className="font-semibold text-foreground">Check the tabs</span> for file configs, import statistics, and execution logs</span>
              </li>
            </ul>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <p className="text-sm text-muted-foreground flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
              <span>
                <span className="font-semibold text-foreground">Tip:</span> Start by clicking the <span className="font-mono bg-background px-1 rounded">Start</span> node 
                in the top-left to see the workflow overview, then follow the flow downward through each phase.
              </span>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} className="w-full" data-testid="button-close-onboarding">
            Got it, let's explore the workflow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
