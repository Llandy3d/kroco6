import type { Test } from "@/lib/stores/blocks/model/loose";
import type { ProjectSettings } from "@/schemas/project";

interface NewPath {
  type: "new";
  initial: string;
}

interface ExistingPath {
  type: "existing";
  filePath: string;
  original: string;
}

type Path = NewPath | ExistingPath;

interface TabBase {
  handle: string;
  name: string;
}

interface FileTabBase extends TabBase {
  path: Path;
}

interface BlockTab extends FileTabBase {
  type: "blocks";
  blocks: Test;
}

interface ScriptTab extends FileTabBase {
  type: "script";
  script: string;
}

interface TestResultsTab extends TabBase {
  type: "test-results";
}

interface ProjectSettingsTab extends FileTabBase {
  type: "project-settings";
  rootPath: string;
  settings: ProjectSettings;
}

type EditorTab = BlockTab | ScriptTab | ProjectSettingsTab | TestResultsTab;
type FileTab = ScriptTab | BlockTab | ProjectSettingsTab;

export {
  type BlockTab,
  type EditorTab,
  type ExistingPath,
  type FileTab,
  type NewPath,
  type Path,
  type ProjectSettingsTab,
  type ScriptTab,
  type TestResultsTab,
};
