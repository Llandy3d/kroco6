import { EMPTY_BLOCK_TEST } from "@/lib/stores/blocks/constants";
import type { Test } from "@/lib/stores/blocks/model/loose";
import { atom, useAtom, useSetAtom } from "jotai";

const test = atom<Test>(EMPTY_BLOCK_TEST);

function useTest() {
  return useAtom(test);
}

function useSetTest() {
  return useSetAtom(test);
}

export { useSetTest, useTest };
