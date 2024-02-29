import { invoke } from '@tauri-apps/api/tauri';

export interface Project {
	name: string;
}

export async function list_projects(): Promise<Project[]> {
	return await invoke('list_projects', {});
}
