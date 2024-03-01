import { invoke } from '@tauri-apps/api/tauri';

export interface Project {
	name: string;
}

export async function listProjects(): Promise<Project[]> {
	return await invoke('list_projects', {});
}

export async function getToken(): Promise<string> {
	return await invoke('get_cloud_token', {});
}

export async function saveToken(token: string): Promise<void> {
	return await invoke('set_cloud_token', { token });
}

export async function runScriptInCloud({
	script,
	projectId
}: {
	script: string;
	projectId: string;
}): Promise<string> {
	return await invoke('run_script_in_cloud', { script, projectId });
}
