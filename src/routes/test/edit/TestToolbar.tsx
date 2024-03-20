import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  loadProjectConfig,
  saveProjectConfig,
  saveToken,
  type Project,
  type ProjectConfig,
} from "@/lib/backend-client";
import type { EditorTab } from "@/lib/stores/editor";
import { Loader2, PlayCircle, Save, UploadCloud } from "lucide-react";
import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";

interface TestToolbarProps {
  file: EditorTab;
  project: Project;
  running: boolean;
  leftItems?: ReactNode;
  rightItems?: ReactNode;
  onSave: (file: EditorTab) => void;
  onRunLocally: () => void;
  onRunInCloud: (config: ProjectConfig) => void;
}

function TestToolbar({
  file,
  project,
  running,
  leftItems,
  rightItems,
  onSave,
  onRunLocally,
  onRunInCloud,
}: TestToolbarProps) {
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [projectConfig, setProjectConfig] = useState<ProjectConfig>({
    cloud_token: "",
    cloud_project_id: "",
  });

  const canRunTestsInCloud =
    !running && projectConfig?.cloud_token !== "" && projectConfig?.cloud_project_id !== "";

  function handleSettingsModalChange(open: boolean) {
    setSettingsModalOpen(open);
  }

  function handleSaveSettings() {
    Promise.all([
      saveToken(projectConfig.cloud_token),
      saveProjectConfig(project.name, projectConfig),
    ]).finally(() => setSettingsModalOpen(false));
  }

  function handleSave() {
    onSave(file);
  }

  useEffect(() => {
    loadProjectConfig(project.name).then(setProjectConfig).catch(console.error);
  }, []);

  function handleCloudTokenChange(ev: ChangeEvent<HTMLInputElement>) {
    setProjectConfig({
      ...projectConfig,
      cloud_token: ev.target.value,
    });
  }

  function handleCloudProjectIdChange(ev: ChangeEvent<HTMLInputElement>) {
    setProjectConfig({
      ...projectConfig,
      cloud_project_id: ev.target.value,
    });
  }

  function handleRunInCloud() {
    onRunInCloud(projectConfig);
  }

  return (
    <div className="flex justify-between rounded-none">
      <div>{leftItems}</div>
      <div className="flex items-center gap-2">
        {rightItems}

        <Button variant="ghost" onClick={handleSave}>
          <Save size={16} />
        </Button>

        <TooltipProvider>
          <Tooltip open={canRunTestsInCloud ? false : undefined}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="border-2 border-primary text-primary"
                onClick={handleRunInCloud}
                disabled={!canRunTestsInCloud}
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
                <>You need to configure a token and project id to run tests in the cloud.</>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button onClick={onRunLocally}>
          <PlayCircle size={14} className="mr-2 h-4 w-4" />
          Run locally
        </Button>
      </div>

      <Dialog open={settingsModalOpen} onOpenChange={handleSettingsModalChange}>
        <DialogContent className="overflow-hidden shadow-lg">
          <DialogHeader>
            <DialogTitle>Enter k6 cloud token</DialogTitle>
            <DialogDescription>
              Authenticate with k6 Cloud to run tests in the cloud.
            </DialogDescription>
          </DialogHeader>
          <Label htmlFor="k6-cloud-token">Cloud token</Label>
          <Input
            id="k6-cloud-token"
            value={projectConfig?.cloud_token}
            onChange={handleCloudTokenChange}
          />

          <Label htmlFor="k6-cloud-project-id">Project Id</Label>
          <Input
            id="k6-cloud-project-id"
            value={projectConfig.cloud_project_id}
            onChange={handleCloudProjectIdChange}
          />

          <DialogFooter>
            <Button type="submit" onClick={handleSaveSettings}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { TestToolbar };
