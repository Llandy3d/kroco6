import {
  listProjects,
  loadEnvironments,
  type EnvironmentsData,
  type Project,
} from "@/lib/backend-client";
import { invoke } from "@tauri-apps/api/tauri";
import { useEffect, useState } from "react";
import { Layout } from "./Layout";

function Page() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [environments, setEnvironments] = useState<EnvironmentsData>({
    active: "",
    environments: [],
  });

  useEffect(() => {
    Promise.all([listProjects(), loadEnvironments()]).then(([projects, environments]) => {
      setProjects(projects);
      setEnvironments(environments);

      invoke("close_splashscreen");
    });
  }, []);

  return (
    <Layout projects={projects} environments={environments}>
      Here's the content
    </Layout>
  );
}

export { Page };
