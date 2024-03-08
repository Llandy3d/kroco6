import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCloudTests, type CloudTest, type Project } from "@/lib/backend-client";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { ScriptPreview } from "./ScriptPreview";

interface ImportDialogProps {
  open: boolean;
  project: Project;
  onDismiss: () => void;
  onImport: (script: string) => void;
}

function ImportDialog({ open, project, onDismiss, onImport }: ImportDialogProps) {
  const [loading, setLoading] = useState(true);
  const [cloudTests, setCloudTests] = useState<CloudTest[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    getCloudTests(project.name)
      .then((tests) => {
        setCloudTests(tests.filter((test) => test.script !== null));
      })
      .finally(() => setLoading(false));
  }, [open]);

  function handleOpenChange() {
    onDismiss();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Test from the Cloud</DialogTitle>
          <DialogDescription>
            <Alert variant="destructive" className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription>
                Importing a new script will overwrite your existing script. It is recommended to
                save your work before continuing since this action cannot be undone.
              </AlertDescription>
            </Alert>
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[400px] overflow-auto">
          {cloudTests.map((test) => {
            return (
              <div key={test.id} className="flex items-center gap-2 border-b">
                <ScriptPreview test={test} />
                <div className="flex-1 text-ellipsis">{test.name}</div>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    onImport(test.script ?? "");
                  }}
                >
                  Import
                </Button>
              </div>
            );
          })}
          {cloudTests.length === 0 && <div>{loading ? "Loading..." : "No tests found"}</div>}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { ImportDialog };
