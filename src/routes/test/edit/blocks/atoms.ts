import { findBlock } from "@/lib/stores/blocks";
import { EMPTY_BLOCK_TEST } from "@/lib/stores/blocks/constants";
import type { Block, Test } from "@/lib/stores/blocks/model/loose";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";

const testAtom = atom<Test>(EMPTY_BLOCK_TEST);

const selectedBlockIdAtom = atom<string | null>(null);

const selectedBlockAtom = atom(
  (get) => {
    const test = get(testAtom);
    const selected = get(selectedBlockIdAtom);

    if (selected === null) {
      return null;
    }

    return findBlock(test, selected);
  },
  (_get, set, block: Block | null) => {
    set(selectedBlockIdAtom, block && block.id);
  },
);

function useTest() {
  return useAtom(testAtom);
}

function useTestValue() {
  return useAtomValue(testAtom);
}

function useSetTest() {
  return useSetAtom(testAtom);
}

function useSelectedBlockValue() {
  return useAtomValue(selectedBlockAtom);
}

function useSetSelectedBlock() {
  return useSetAtom(selectedBlockAtom);
}

export { testAtom, useSelectedBlockValue, useSetSelectedBlock, useSetTest, useTest, useTestValue };
