import { invoke } from "@tauri-apps/api/tauri";

export interface Environment {
  name: string;
  description?: string;
  variables: Record<string, string>;
}

export interface EnvironmentsData {
  active: string;
  environments: Array<Environment>;
}

// load environments from disk
export async function loadEnvironments(): Promise<EnvironmentsData> {
  return await invoke("load_environments", {});
}

// save environments to disk
export async function saveEnvironments(environmentsData: EnvironmentsData): Promise<void> {
  return await invoke("save_environments", { environmentsData });
}

export interface Project {
  name: string;
  description?: string;
}

export class Test {
  // The name of the test as it should be displayed
  // by the UI.
  name: string;

  // The kind of the test.
  kind: TestKind;

  // The content of the test serialized as a string.
  content: string;

  constructor(name: string, kind: TestKind, content: string) {
    this.name = name;
    this.kind = kind;
    this.content = content;
  }
}

// TestKind indicates the underlying type of a test's
// content: serialized blocks, javascript or an
// openapi specification.
export type TestKind = "Blocks" | "Javascript" | "OpenAPI";

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

/**
 * Create a new test as part of the seclect `projectName`.
 *
 * @param projectName The name of the parent project
 * @param test The test to create
 * @returns The created test
 */
export async function createTest(projectName: string, test: Test): Promise<Test> {
  return await invoke("create_test", { projectName, test });
}

/**
 * List the tests for a project
 *
 * @param projectName The name of the parent project to list tests for
 * @returns The list of tests for the project
 */
export async function listTests(projectName: string): Promise<Test[]> {
  return await invoke("list_tests", { projectName });
}

/**
 * Get a test by name
 *
 * @param projectName The name of the parent project
 * @param testName The name of the test
 * @returns The sought after test
 */
export async function getTest(projectName: string, testName: string): Promise<Test> {
  return await invoke("get_test", { projectName, testName });
}

/**
 * Save the test and updates its content with the new content as provided
 * by the UI.
 *
 * @param projectName The name of the parent project
 * @param testName The name of the test to save the content of
 * @param newContent The new content of the test to save
 */
export async function saveTest(
  projectName: string,
  testName: string,
  newContent: string,
): Promise<void> {
  return await invoke("save_test", { projectName, testName, newContent });
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

export async function getToken(): Promise<string> {
  return await invoke("get_cloud_token", {});
}

export async function saveToken(token: string): Promise<void> {
  return await invoke("set_cloud_token", { token });
}
