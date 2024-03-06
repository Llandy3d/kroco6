import { NEW_BLOCKS_TEST, NEW_SCRIPT } from "$lib/files";
import { nanoid } from "nanoid";
import { get, writable } from "svelte/store";

interface NewPath {
  type: "new";
  initial: string;
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

const openFiles = writable<VirtualFile[]>([]);

const currentFile = writable<VirtualFile | null>(null);

function calculateNameClashes(name: string) {
  return get(openFiles).filter((file) => file.name.startsWith(name)).length;
}

function newFile({ type, initial }: { type: VirtualFile["type"]; initial?: string }) {
  const name = type === "block" ? "New Blocks" : "New Script";
  const clashes = calculateNameClashes(name);

  const newFile: VirtualFile = {
    type,
    handle: nanoid(),
    name: clashes > 0 ? `${name} (${clashes + 1})` : name,
    path: { type: "new", initial: initial ?? (type === "block" ? NEW_BLOCKS_TEST : NEW_SCRIPT) },
  };

  openFiles.update((files) => {
    return [...files, newFile];
  });

  currentFile.set(newFile);
}

function openFile(file: VirtualFile) {
  openFiles.update((files) => {
    return [...files, file];
  });

  currentFile.set(file);
}

export {
  currentFile,
  newFile,
  openFile,
  openFiles,
  type BlockFile,
  type ExistingPath,
  type NewPath,
  type VirtualFile as OpenFile,
  type Path,
  type ScriptFile,
};
