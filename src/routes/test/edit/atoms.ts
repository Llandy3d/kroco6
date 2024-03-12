import type { VirtualFile } from "@/lib/stores/editor";
import { atom, useAtom, useSetAtom } from "jotai";

const openFiles = atom<VirtualFile[]>([]);
const currentFile = atom<VirtualFile | null>(null);

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
