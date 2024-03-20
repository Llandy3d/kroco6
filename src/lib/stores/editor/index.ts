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
  path: Path;
}

interface BlockTab extends TabBase {
  type: "blocks";
  blocks: Test;
}

interface ScriptTab extends TabBase {
  type: "script";
  script: string;
}

interface ProjectSettingsTab extends TabBase {
  type: "project-settings";
  rootPath: string;
  settings: ProjectSettings;
}

type EditorTab = BlockTab | ScriptTab | ProjectSettingsTab;

export {
  type BlockTab,
  type EditorTab,
  type ExistingPath,
  type NewPath,
  type Path,
  type ProjectSettingsTab,
  type ScriptTab,
};
