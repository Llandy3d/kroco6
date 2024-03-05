import { writable } from "svelte/store";
import { EMPTY_LIBRARY } from "./constants";
import {
  instantiate,
  isTemplate,
  type Block,
  type GroupBlock,
  type Root,
  type ScenarioBlock,
  type Test,
} from "./model/loose";
import type { StepBlock } from "./model/strict";
import { concat, detach, replace } from "./model/utils";

const test = writable<Test>({
  library: EMPTY_LIBRARY,
  roots: [],
});

function loadTest(value: Test) {
  test.set(value);
}

function dropOnCanvas(target: Block, position: { top: number; left: number }) {
  test.update((test) => {
    const instance = instantiate(target);

    const existing = test.roots.find((root) => root.block.id === instance.id);

    if (existing !== undefined) {
      const newRoot = {
        ...existing,
        top: position.top,
        left: position.left,
      };

      return {
        ...test,
        roots: test.roots.map((root) => (root.block.id === instance.id ? newRoot : root)),
      };
    }

    const newRoot: Root = {
      type: "root",
      block: instance,
      top: position.top,
      left: position.left,
    };

    const filtered = test.roots.map((root) => {
      return { ...root, block: detach(root.block, target) };
    });

    return {
      ...test,
      roots: [...filtered, newRoot],
    };
  });
}

function detachBlock(block: Block) {
  test.update((test) => {
    if (isTemplate(block)) {
      return test;
    }

    const roots = test.roots
      .filter((root) => root.block.id !== block.id)
      .map((root) => ({
        ...root,
        block: detach(root.block, block),
      }));

    return { ...test, roots };
  });
}

function updateBlock(block: Block) {
  test.update((test) => {
    const roots = test.roots.map((root) => ({
      ...root,
      block: root.block.id === block.id ? block : replace(root.block, block, block),
    }));

    return { ...test, roots };
  });
}

function insertStep(block: ScenarioBlock | GroupBlock, step: StepBlock) {
  detachBlock(step);

  const newStep = instantiate(step);

  updateBlock({
    ...block,
    step: block.step !== null ? concat(newStep, block.step) : newStep,
  });
}

function insertNext(block: StepBlock, next: StepBlock) {
  detachBlock(next);

  const newNext = instantiate(next);

  updateBlock({
    ...block,
    next: block.next !== null ? concat(newNext, block.next) : newNext,
  });
}

export { detachBlock, dropOnCanvas, insertNext, insertStep, loadTest, test, updateBlock };
