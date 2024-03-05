import { nanoid } from "nanoid";
import * as strict from "./strict";

const template = Symbol("This block is a template and should be cloned before use.");

type WithTemplate<T> = T & {
  [template]?: true;
};

type GroupBlock = Omit<strict.GroupBlock, "next" | "step"> & {
  step: Block | null;
  next: Block | null;
};

type LibraryBlock = Omit<strict.LibraryBlock, "next"> & {
  next: Block | null;
};

type CheckBlock = Omit<strict.CheckBlock, "next" | "target"> & {
  target: Block | null;
  next: Block | null;
};

type ScenarioBlock = Omit<strict.ScenarioBlock, "step"> & {
  step: Block | null;
};

type SleepBlock = Omit<strict.SleepBlock, "next"> & {
  next: Block | null;
};

type ExecutorBlock = strict.ExecutorBlock;

type Block =
  | WithTemplate<GroupBlock>
  | WithTemplate<LibraryBlock>
  | WithTemplate<CheckBlock>
  | WithTemplate<ScenarioBlock>
  | WithTemplate<ExecutorBlock>
  | WithTemplate<SleepBlock>;

type Chainable = Extract<Block, { next: Block | null }>;

type Root = Omit<strict.Root, "block"> & {
  block: Block;
};

type Test = Omit<strict.Test, "roots"> & {
  roots: Root[];
};

function defineTemplate<T extends Block>(block: T): WithTemplate<T> {
  return {
    ...block,
    [template]: true,
  };
}

function isTemplate(block: Block): boolean {
  return block[template] === true;
}

function instantiate<T extends Block>(block: T): T {
  if (!isTemplate(block)) {
    return block;
  }

  const instance = {
    ...block,
    id: nanoid(),
  };

  delete instance[template];

  return instance;
}

export {
  defineTemplate,
  instantiate,
  isTemplate,
  type Block,
  type Chainable,
  type CheckBlock,
  type ExecutorBlock,
  type GroupBlock,
  type LibraryBlock,
  type Root,
  type ScenarioBlock,
  type SleepBlock,
  type Test,
};
