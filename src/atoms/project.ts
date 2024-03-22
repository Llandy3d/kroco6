import type { Project } from "@/lib/backend-client";
import {
  atom,
  getDefaultStore,
  useAtom,
  useAtomValue,
  useSetAtom,
} from "jotai";

const projectAtom = atom<Project | null>(null);

function useProject() {
  return useAtom(projectAtom, {
    store: getDefaultStore(),
  });
}

function useSetProject() {
  return useSetAtom(projectAtom, {
    store: getDefaultStore(),
  });
}

function useProjectValue() {
  return useAtomValue(projectAtom, {
    store: getDefaultStore(),
  });
}

export { useProject, useProjectValue, useSetProject };
