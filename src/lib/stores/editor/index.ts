import type { Test } from "@/lib/stores/blocks/model/loose";

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

interface OpenFileBase {
  handle: string;
  name: string;
  path: Path;
}

interface BlockFile extends OpenFileBase {
  type: "blocks";
  blocks: Test;
}

interface ScriptFile extends OpenFileBase {
  type: "script";
}

type VirtualFile = BlockFile | ScriptFile;

export {
  type BlockFile,
  type ExistingPath,
  type NewPath,
  type Path,
  type ScriptFile,
  type VirtualFile,
};
