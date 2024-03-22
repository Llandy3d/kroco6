import { Button } from "@/components/base/button";
import { Separator } from "@/components/base/separator";
import { Logo } from "@/components/illustrations/Logo";
import {
  loadProjectSettings,
  openProject,
  refreshProject,
  type Project,
} from "@/lib/backend-client";
import { ProjectTree } from "@/views/sidebar/ProjectTree";
import { ExternalLink, Settings } from "lucide-react";
import { useEffect } from "react";
import { SidebarSection } from "./SidebarSection";

import { useProject } from "@/atoms/project";
import { useOpenTabs, useSetCurrentTab } from "@/atoms/tabs";
import type { ProjectSettingsTab } from "@/lib/stores/editor";
import { listen } from "@tauri-apps/api/event";
import { nanoid } from "nanoid";

function Sidebar() {
  const setCurrentFile = useSetCurrentTab();
  const [openFiles, setOpenFiles] = useOpenTabs();

  const [project, setProject] = useProject();

  function handleOpenProject() {
    openProject().then((result) => {
      if (result.type === "cancelled") {
        return;
      }

      setProject(result.project);
    });
  }

  function handleProjectChange(project: Project) {
    setProject(project);
  }

  function handleOpenProjectSettings() {
    if (project === null) {
      return;
    }

    const existing = openFiles.find((file) => file.type === "project-settings");

    if (existing) {
      setCurrentFile(existing.handle);

      return;
    }

    loadProjectSettings(project).then((settings) => {
      const tab: ProjectSettingsTab = {
        type: "project-settings",
        handle: nanoid(),
        name: "Project Settings",
        path: {
          type: "existing",
          filePath: `${project.root}/k6.json`,
          original: JSON.stringify(settings),
        },
        rootPath: project.root,
        settings,
      };

      setOpenFiles((tabs) => [...tabs, tab]);
      setCurrentFile(tab.handle);
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
          <h2 className="flex justify-between font-bold">
            Project{" "}
            <button onClick={handleOpenProjectSettings}>
              <Settings size={18} />
            </button>
          </h2>
          <ProjectTree project={project} onChange={handleProjectChange} />
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
