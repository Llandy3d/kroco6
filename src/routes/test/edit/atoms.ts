import type { EditorTab } from "@/lib/stores/editor";
import { atom, useAtom, useSetAtom } from "jotai";

const openFiles = atom<EditorTab[]>([]);

const currentHandle = atom<string | null>(null);

const currentFile = atom(
  (get) => {
    const handle = get(currentHandle);
    const files = get(openFiles);

    return files.find((file) => file.handle === handle) ?? null;
  },
  (_get, set, handle: string | null) => {
    set(currentHandle, handle);
  },
);

function useOpenFiles() {
  return useAtom(openFiles);
}

function useSetOpenFiles() {
  return useSetAtom(openFiles);
}

function useCurrentFile() {
  return useAtom(currentFile);
}

function useSetCurrentFile() {
  return useSetAtom(currentFile);
}

export { useCurrentFile, useOpenFiles, useSetCurrentFile, useSetOpenFiles };
