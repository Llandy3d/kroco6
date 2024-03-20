import type { EditorTab } from "@/lib/stores/editor";
import { atom, useAtom, useSetAtom } from "jotai";

const openTabs = atom<EditorTab[]>([]);

const currentHandle = atom<string | null>(null);

const currentTab = atom(
  (get) => {
    const handle = get(currentHandle);
    const files = get(openTabs);

    return files.find((file) => file.handle === handle) ?? null;
  },
  (_get, set, handle: string | null) => {
    set(currentHandle, handle);
  },
);

function useOpenTabs() {
  return useAtom(openTabs);
}

function useSetOpenTabs() {
  return useSetAtom(openTabs);
}

function useCurrentTab() {
  return useAtom(currentTab);
}

function useSetCurrentTab() {
  return useSetAtom(currentTab);
}

export { useCurrentTab, useOpenTabs, useSetCurrentTab, useSetOpenTabs };
