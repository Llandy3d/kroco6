import {
  listProjects,
  loadEnvironments,
  type EnvironmentsData,
  type Project,
} from "@/lib/backend-client";
import { invoke } from "@tauri-apps/api/tauri";
import { useEffect, useState } from "react";
import { Layout } from "./Layout";
import { Editor } from "./test/edit/Editor";

function Page() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [environments, setEnvironments] = useState<EnvironmentsData>({
    active: "",
    environments: [],
  });

  useEffect(() => {
    Promise.all([listProjects(), loadEnvironments()]).then(([projects, environments]) => {
      setActiveProject(projects[0] ?? null);

      setProjects(projects);
      setEnvironments(environments);

      invoke("close_splashscreen");
    });
  }, []);

  return (
    <Layout projects={projects} environments={environments}>
      {activeProject !== null && <Editor project={activeProject} />}
    </Layout>
  );
}

export { Page };
