import { invoke } from "@tauri-apps/api/tauri";

export interface Project {
  name: string;
  description?: string;
}

export interface Environment {
  name: string;
  description?: string;
  variables: Record<string, string>;
}

export interface EnvironmentsData {
  active: string;
  environments: Array<Environment>;
}


/**
 * List all projects
 *
 * @returns A list of all projects
 */
export async function listProjects(): Promise<Project[]> {
  return await invoke("list_projects", {});
}

/**
 * Create a new project
 *
 * @param name The name of the project
 * @param description An optional description of the project
 * @returns The created project
 */
export async function createProject(
  name: string,
  description: string | null = null,
): Promise<Project> {
  return await invoke("create_project", { name, description });
}

export async function getToken(): Promise<string> {
  return await invoke("get_cloud_token", {});
}

export async function saveToken(token: string): Promise<void> {
  return await invoke("set_cloud_token", { token });
}

export function runScriptLocally(script: string): Promise<string> {
  return invoke("open_run_window", { script });
}

export function runScriptInCloud({
  script,
  projectId,
}: {
  script: string;
  projectId: string;
}): Promise<string> {
  return invoke("run_script_in_cloud", { script, projectId });
}

// load environments from disk
export async function loadEnvironments(): Promise<EnvironmentsData> {
  return await invoke("load_environments", {});
}

// save environments to disk
export async function saveEnvironments(environmentsData: EnvironmentsData): Promise<void> {
  return await invoke("save_environments", { environmentsData });
}
