import { listProjects, type Project } from "@/lib/backend-client";
import { invoke } from "@tauri-apps/api/tauri";
import { useEffect, useState } from "react";
import { Layout } from "./Layout";
import { Editor } from "./test/edit/Editor";

function Page() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  useEffect(() => {
    Promise.all([listProjects()]).then(([projects]) => {
      setActiveProject(projects[0] ?? null);

      invoke("close_splashscreen");
    });
  }, []);

  return <Layout>{activeProject !== null && <Editor project={activeProject} />}</Layout>;
}

export { Page };
