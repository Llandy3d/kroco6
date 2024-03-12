import { Logo } from "@/components/illustrations/Logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { openProject, refreshProject, type Project } from "@/lib/backend-client";
import { ProjectTree } from "@/routes/ProjectTree";
import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { SidebarSection } from "./SidebarSection";

import { listen } from "@tauri-apps/api/event";

function Sidebar() {
  const [project, setProject] = useState<Project>();

  function handleOpenProject() {
    openProject().then((result) => {
      if (result.type === "cancelled") {
        return;
      }

      setProject(result.project);
    });
  }

  useEffect(() => {
    const unlisten = listen("files_changed", () => {
      console.log("files changed", project?.root);

      if (project?.root === undefined) {
        return;
      }

      console.log("refreshing project...");

      refreshProject(project.root).then(setProject).catch(console.error);
    });

    return () => {
      console.log("unlistening...");

      unlisten.then((dispose) => dispose());
    };
  }, [project]);

  return (
    <div className="flex h-screen flex-col gap-4 p-4">
      <Logo className="self-center" />
      <Separator />

      {project && (
        <>
          <h2 className="font-bold">Project</h2>
          <ProjectTree project={project} />
        </>
      )}
      {!project && (
        <div className="flex flex-auto flex-col items-center justify-center">
          <Button variant="ghost" onClick={handleOpenProject}>
            Open Project
          </Button>
        </div>
      )}

      <SidebarSection title="Discover" className="mt-auto pb-2">
        <div className="mt-1 flex flex-col items-start text-sm">
          <a
            href="https://grafana.com/docs/k6/latest/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 py-[4px]"
          >
            <ExternalLink size="12" />
            k6 OSS docs
          </a>
          <a
            href="https://grafana.com/docs/k6/latest/javascript-api/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 py-[4px]"
          >
            <ExternalLink size="12" />
            k6 JavaScript API
          </a>
          <a
            href="https://grafana.com/docs/k6/latest/misc/integrations/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 py-[4px]"
          >
            <ExternalLink size="12" />
            Integrations
          </a>
        </div>
      </SidebarSection>
    </div>
  );
}

export { Sidebar };
