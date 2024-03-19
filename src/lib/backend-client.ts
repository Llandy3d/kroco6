import type { VirtualFile } from "@/lib/stores/editor";
import { invoke } from "@tauri-apps/api/tauri";

interface Environment {
  name: string;
  description?: string;
  variables: Record<string, string>;
}

interface EnvironmentsData {
  active: string;
  environments: Array<Environment>;
}

interface CloudTest {
  id: string;
  name: string;
  project_id: string;
  script: string | null;
}

interface ProjectConfig {
  cloud_token: string;
  cloud_project_id: string;
}

interface Project {
  name: string;
  test_collections?: Array<Test>;
  description?: string;
  project_config?: ProjectConfig;
}

class Test {
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
type TestKind = "Blocks" | "Javascript" | "OpenAPI";

/**
 * List all projects
 *
 * @returns A list of all projects
 */
async function listProjects(): Promise<Project[]> {
  return await invoke("list_projects", {});
}

function runScriptLocally(script: string): Promise<string> {
  return invoke("open_run_window", { script });
}

function runScriptInCloud({
  script,
  projectId,
}: {
  script: string;
  projectId: string;
}): Promise<string> {
  return invoke("run_script_in_cloud", { script, projectId });
}

async function saveToken(token: string): Promise<void> {
  return await invoke("set_cloud_token", { token });
}

// load project config
async function loadProjectConfig(projectName: string): Promise<ProjectConfig> {
  return await invoke("load_project_config", { projectName });
}

// save project config
async function saveProjectConfig(projectName: string, projectConfig: ProjectConfig): Promise<void> {
  return await invoke("save_project_config", { projectName, projectConfig });
}

async function getCloudTests(projectName: string): Promise<Array<CloudTest>> {
  return await invoke("get_cloud_tests", { projectName });
}

interface Project {
  root: string;
  directory: ProjectDirectory;
}

interface ProjectFile {
  type: "file";
  kind: "script" | "blocks";
  path: string;
}

interface ProjectDirectory {
  type: "directory";
  path: string;
  entries: Array<ProjectEntry>;
}

type ProjectEntry = ProjectFile | ProjectDirectory;

interface ProjectOpened {
  type: "project-opened";
  project: Project;
}

interface OpenProjectCancelled {
  type: "cancelled";
}

type OpenProjectResult = ProjectOpened | OpenProjectCancelled;

interface FileOpenResult {
  path: string;
  content: string;
}

function openProject(): Promise<OpenProjectResult> {
  return invoke("open_project", {});
}

function refreshProject(root: string) {
  return invoke<Project>("refresh_project", { root });
}

function openFile(path: string): Promise<FileOpenResult> {
  return invoke("open_file", { path });
}

interface SavedResult {
  type: "saved";
  path: string;
}

interface SaveCancelled {
  type: "cancelled";
}

type SaveFileResult = SavedResult | SaveCancelled;

async function saveFile(file: VirtualFile, content: string): Promise<VirtualFile> {
  const result =
    file.path.type === "existing"
      ? await invoke<SaveFileResult>("save_file", { params: { path: file.path.filePath, content } })
      : await saveFileAs(file, content);

  if (result.type === "cancelled") {
    return file;
  }

  return {
    ...file,
    name: result.path.slice(result.path.lastIndexOf("/") + 1),
    path: {
      type: "existing",
      filePath: result.path,
      original: content,
    },
  };
}

function saveFileAs(file: VirtualFile, content: string) {
  return invoke<SaveFileResult>("save_file_as", {
    params: {
      kind: file.type,
      fileName: file.name + (file.type === "blocks" ? ".blk6" : ".js"),
      content,
    },
  });
}

interface RenameResult {
  path: string;
}

function rename(from: string, to: string) {
  return invoke<RenameResult>("rename", { from, to });
}

interface CreateDirectoryResult {
  path: string;
  project: Project;
}

function createDirectory(root: string, path: string) {
  return invoke<CreateDirectoryResult>("create_directory", { root, path });
}

interface DeleteDirectoryResult {
  project: Project;
}

function deleteEntry(root: string, type: "file" | "directory", path: string) {
  return type === "file" ? deleteFile(root, path) : deleteDirectory(root, path);
}

function deleteFile(root: string, path: string) {
  return invoke<DeleteDirectoryResult>("delete_file", { root, path });
}

function deleteDirectory(root: string, path: string) {
  return invoke<DeleteDirectoryResult>("delete_directory", { root, path });
}

export {
  createDirectory,
  deleteEntry,
  getCloudTests,
  listProjects,
  loadProjectConfig,
  openFile,
  openProject,
  refreshProject,
  rename,
  runScriptInCloud,
  runScriptLocally,
  saveFile,
  saveFileAs,
  saveProjectConfig,
  saveToken,
  type CloudTest,
  type Environment,
  type EnvironmentsData,
  type Project,
  type ProjectConfig,
  type ProjectDirectory,
  type ProjectEntry,
  type ProjectFile,
  type ProjectOpened,
  type Test,
  type TestKind,
};
