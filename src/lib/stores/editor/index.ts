import { nanoid } from "nanoid";
import { get, writable } from "svelte/store";

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

const openFiles = writable<VirtualFile[]>([]);

const currentFile = writable<VirtualFile | null>(null);

function calculateNameClashes(name: string) {
  return get(openFiles).filter((file) => file.name.startsWith(name)).length;
}

function newFile(type: VirtualFile["type"], preferredName?: string) {
  const name = preferredName ?? `New ${type === "block" ? "Test" : "Script"}`;
  const clashes = calculateNameClashes(name);

  const newFile: VirtualFile = {
    handle: nanoid(),
    name: clashes > 0 ? `${name} (${clashes + 1})` : name,
    path: { type: "new" },
    type,
  };

  openFiles.update((files) => {
    return [...files, newFile];
  });

  currentFile.set(newFile);
}

function updateFile(handle: string, update: Partial<VirtualFile>) {
  openFiles.update((files) => {
    return files.map((file) => (file.handle === handle ? { ...file, ...update } : file));
  });

  currentFile.update((file) => {
    return file?.handle === handle ? { ...file, ...update } : file;
  });
}

export {
  openFiles,
  currentFile,
  newFile,
  updateFile,
  type VirtualFile as OpenFile,
  type BlockFile,
  type ScriptFile,
  type Path,
  type NewPath,
  type ExistingPath,
};
