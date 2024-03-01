import { invoke } from '@tauri-apps/api/tauri';

export interface Project {
	name: string;
	description?: string;
}

/**
 * List all projects
 *
 * @returns A list of all projects
 */
export async function listProjects(): Promise<Project[]> {
	return await invoke('list_projects', {});
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
	description: string | null = null
): Promise<Project> {
	return await invoke('create_project', { name, description });
}
