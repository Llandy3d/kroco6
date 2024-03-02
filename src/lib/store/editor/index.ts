import { writable } from "svelte/store";

interface NewPath {
  type: "new";
}

interface ExistingPath {
  type: "existing";
  path: string;
  original: string;
}

type Path = NewPath | ExistingPath;

interface OpenFileBase {
  handle: string;
  name: string;
  path: Path;
}

interface BlockFile extends OpenFileBase {
  type: "block";
}

interface ScriptFile extends OpenFileBase {
  type: "script";
}

type VirtualFile = BlockFile | ScriptFile;

const openFiles = writable<VirtualFile[]>([
  {
    handle: "1",
    name: "Untitled Test",
    path: { type: "new" },
    type: "block",
  },
]);
const currentFile = writable<VirtualFile | null>(null);

export {
  openFiles,
  currentFile,
  type VirtualFile as OpenFile,
  type BlockFile,
  type ScriptFile,
  type Path,
  type NewPath,
  type ExistingPath,
};
