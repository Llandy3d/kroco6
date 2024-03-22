import type { EditorTab, FileTab } from "@/lib/stores/editor";
import type { ProjectSettings } from "@/schemas/project";
import { invoke } from "@tauri-apps/api/tauri";

interface Environment {
  name: string;
  description?: string;
  variables: Record<string, string>;
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

function runScriptLocally(
  project: ProjectSettings,
  script: string,
): Promise<string> {
  return invoke("run_script", {
    script,
    version: project.k6.version,
  });
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
async function saveProjectConfig(
  projectName: string,
  projectConfig: ProjectConfig,
): Promise<void> {
  return await invoke("save_project_config", { projectName, projectConfig });
}

async function getCloudTests(projectName: string): Promise<Array<CloudTest>> {
  return await invoke("get_cloud_tests", { projectName });
}

interface Project {
  root: string;
  directory: ProjectDirectory;
  settings: ProjectSettings;
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
  project: Project;
}

interface SaveCancelled {
  type: "cancelled";
}

type SaveFileResult = SavedResult | SaveCancelled;

interface ProjectAndTab {
  project: Project;
  tab: EditorTab;
}

async function saveFile(
  project: Project,
  tab: FileTab,
  content: string,
): Promise<ProjectAndTab> {
  const result =
    tab.path.type === "existing"
      ? await invoke<SaveFileResult>("save_file", {
          root: project.root,
          path: tab.path.filePath,
          content,
        })
      : await saveFileAs(project, tab, content);

  if (result.type === "cancelled") {
    return { project, tab };
  }

  return {
    project: result.project,
    tab: {
      ...tab,
      name: result.path.slice(result.path.lastIndexOf("/") + 1),
      path: {
        type: "existing",
        filePath: result.path,
        original: content,
      },
    },
  };
}

function saveFileAs(project: Project, file: EditorTab, content: string) {
  return invoke<SaveFileResult>("save_file_as", {
    root: project.root,
    kind: file.type,
    fileName: file.name + (file.type === "blocks" ? ".blk6" : ".js"),
    content,
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

function loadProjectSettings(project: Project) {
  return invoke<ProjectSettings>("load_project_settings", {
    root: project.root,
  });
}

function isVersionInstalled(version: string) {
  return invoke<boolean>("is_k6_version_installed", { version });
}

interface Version {
  version: string;
  name: string;
  url: string;
}

function installVersion(version: Version) {
  return invoke<void>("install_k6_version", {
    ...version,
  });
}

export {
  createDirectory,
  deleteEntry,
  getCloudTests,
  installVersion,
  isVersionInstalled,
  listProjects,
  loadProjectConfig,
  loadProjectSettings,
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
  type Environment,
  type Project,
  type ProjectConfig,
  type ProjectDirectory,
  type ProjectEntry,
  type ProjectFile,
  type Test,
  type Version,
};
