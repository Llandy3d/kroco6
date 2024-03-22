import { atom, useSetAtom } from "jotai";

const currentRun = atom<Promise<void> | null>(null);

function useSetCurrentRun() {
  return useSetAtom(currentRun);
}

export { useSetCurrentRun };
