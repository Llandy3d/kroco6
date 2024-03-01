import { invoke } from '@tauri-apps/api/tauri';

export interface Project {
	name: string;
}

export async function listProjects(): Promise<Project[]> {
	return await invoke('list_projects', {});
}
