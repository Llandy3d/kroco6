import { Button } from "@/components/base/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/base/tooltip";
import { type ProjectConfig } from "@/lib/backend-client";
import type { FileTab } from "@/lib/stores/editor";
import { Loader2, PlayCircle, Save, UploadCloud } from "lucide-react";
import { type ReactNode } from "react";

interface TestToolbarProps {
  file: FileTab;
  running: boolean;
  leftItems?: ReactNode;
  rightItems?: ReactNode;
  onSave: (file: FileTab) => void;
  onRunLocally: () => void;
  onRunInCloud: (config: ProjectConfig) => void;
}

function TestToolbar({
  file,
  running,
  leftItems,
  rightItems,
  onSave,
  onRunLocally,
}: TestToolbarProps) {
  function handleSave() {
    onSave(file);
  }

  function handleRunInCloud() {}

  return (
    <div className="flex justify-between rounded-none">
      <div>{leftItems}</div>
      <div className="flex items-center gap-2">
        {rightItems}

        <Button variant="ghost" onClick={handleSave}>
          <Save size={16} />
        </Button>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="border-2 border-primary text-primary"
                onClick={handleRunInCloud}
                disabled={true}
              >
                {running ? (
                  <Loader2 size={14} className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UploadCloud size={14} className="mr-2 h-4 w-4" />
                )}
                Run in the Cloud
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {running ? (
                <>Cloud run in progress</>
              ) : (
                <>
                  You need to configure a token and project id to run tests in
                  the cloud.
                </>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button onClick={onRunLocally}>
          <PlayCircle size={14} className="mr-2 h-4 w-4" />
          Run locally
        </Button>
      </div>
    </div>
  );
}

export { TestToolbar };
