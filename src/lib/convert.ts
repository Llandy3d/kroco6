import { exhaustive } from "./utils/typescript";
import {
  type Block,
  type StepBlock,
  type HttpRequestBlock,
  type BlockTest,
  isScenarioBlock,
  isStepBlock,
  type GroupBlock,
  isHttpRequestBlock,
  type CheckBlock,
} from "./stores/test/types";
import type { GroupStep, HttpRequestStep, Step, Test } from "./types";
import { emitScript } from "./codegen";

interface BlockLookup {
  [id: string]: {
    next?: Block | undefined;
    collections: {
      [name: string]: Block;
    };
  };
}

function* enumerate(start: Block | undefined, lookup: BlockLookup): Generator<Block> {
  let current = start;

  while (current !== undefined) {
    yield current;

    current = lookup[current.id]?.next;
  }
}

function toHttpRequestStep(block: HttpRequestBlock): HttpRequestStep {
  return {
    type: "http-request",
    name: block.name,
    method: block.method,
    url: block.url,
  };
}

function toGroupStep(lookup: BlockLookup, block: GroupBlock): GroupStep {
  const firstStep = lookup[block.id]?.collections["steps"];

  return {
    type: "group",
    name: block.name,
    steps: [...enumerate(firstStep, lookup)]
      .filter(isStepBlock)
      .map((step) => toStep(lookup, step)),
  };
}

function toCheckStep(lookup: BlockLookup, block: CheckBlock): Step {
  const target = lookup[block.id]?.collections["target"];

  if (!isHttpRequestBlock(target)) {
    throw new Error("Expected target to be an http request.");
  }

  return {
    type: "check",
    target: toHttpRequestStep(target),
    checks: block.checks.map((check) => {
      switch (check.type) {
        case "has-status":
          return {
            type: "has-status",
            status: check.status,
          };

        case "body-contains":
          return {
            type: "body-contains",
            value: check.value,
          };

        default:
          return exhaustive(check);
      }
    }),
  };
}

function toStep(lookup: BlockLookup, block: StepBlock): Step {
  switch (block.type) {
    case "check":
      return toCheckStep(lookup, block);

    case "http-request":
      return toHttpRequestStep(block);

    case "group":
      return toGroupStep(lookup, block);

    default:
      return exhaustive(block);
  }
}

function blocksToTest(blocks: Block[]): Test {
  const lookup = blocks.reduce<BlockLookup>((acc, block) => {
    acc[block.id] = acc[block.id] ?? { collections: {} };

    if (block.parent.type === "collection") {
      const parent = acc[block.parent.ownerId] ?? { collections: {} };

      parent.collections[block.parent.name] = block;

      acc[block.parent.ownerId] = parent;

      return acc;
    }

    if (block.parent.type === "block") {
      const parent = acc[block.parent.id] ?? { collections: {} };

      parent.next = block;

      acc[block.parent.id] = parent;

      return acc;
    }

    return acc;
  }, {});

  const scenarios = blocks.filter(isScenarioBlock);

  return {
    scenarios: scenarios.map((scenario) => {
      const firstStep = lookup[scenario.id]?.collections["steps"];

      return {
        name: scenario.name,
        executors: [],
        steps: [...enumerate(firstStep, lookup)]
          .filter(isStepBlock)
          .map((step) => toStep(lookup, step)),
      };
    }),
  };
}

function convertToScript(blockTest: BlockTest) {
  return emitScript(blocksToTest(blockTest.blocks));
}

export { convertToScript };
