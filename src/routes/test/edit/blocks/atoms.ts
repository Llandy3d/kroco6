import { EMPTY_BLOCK_TEST } from "@/lib/stores/blocks/constants";
import type { Test } from "@/lib/stores/blocks/model/loose";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";

const testAtom = atom<Test>(EMPTY_BLOCK_TEST);

function useTest() {
  return useAtom(testAtom);
}

function useTestValue() {
  return useAtomValue(testAtom);
}

function useSetTest() {
  return useSetAtom(testAtom);
}

export { testAtom, useSetTest, useTest, useTestValue };
