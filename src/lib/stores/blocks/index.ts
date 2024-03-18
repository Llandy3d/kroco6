import {
  instantiate,
  isTemplate,
  type Block,
  type Chainable,
  type GroupBlock,
  type Root,
  type ScenarioBlock,
  type Test,
} from "./model/loose";
import type { StepBlock } from "./model/strict";
import { concat, detach, replace } from "./model/utils";

function dropOnCanvas(test: Test, target: Block, position: { top: number; left: number }): Test {
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
}

function detachBlock(test: Test, block: Block) {
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
}

function updateBlock(test: Test, block: Block) {
  const roots = test.roots.map((root) => ({
    ...root,
    block: root.block.id === block.id ? block : replace(root.block, block, block),
  }));

  return { ...test, roots };
}

function insertChild(test: Test, block: ScenarioBlock | GroupBlock, step: StepBlock) {
  if (step.id === block.step?.id) {
    return test;
  }

  const newStep = instantiate(step);
  const newBlock = detach(block, step);

  return updateBlock(detachBlock(test, step), {
    ...newBlock,
    step: newBlock.step !== null ? concat(newStep, newBlock.step) : newStep,
  });
}

function insertNext(test: Test, block: Chainable, next: StepBlock) {
  if (next.id === block.next?.id) {
    return test;
  }

  const newNext = instantiate(next);
  const newBlock = detach(block, next);

  return updateBlock(detachBlock(test, next), {
    ...newBlock,
    next: newBlock.next !== null ? concat(newNext, newBlock.next) : newNext,
  });
}

function snapStepToBottom(target: StepBlock, step: StepBlock) {
  function concat<T extends { next: T | null }>(current: T, newNext: T): T {
    return {
      ...current,
      next: current.next !== null ? concat(current.next, newNext) : newNext,
    };
  }

  const newStep = instantiate(step);

  return {
    ...detach(target, instantiate(newStep)),
    next: target.next !== null ? concat(newStep, target.next) : newStep,
  };
}

export { detachBlock, dropOnCanvas, insertChild, insertNext, snapStepToBottom, updateBlock };
