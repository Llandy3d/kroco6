import { exhaustive } from "./utils/typescript";
import type {
  ScenarioBlock,
  Block,
  ExecutorBlock,
  StepBlock,
  HttpRequestBlock,
  BlockTest,
} from "./stores/test/types";
import type { Executor, HttpRequestStep, Step, Test } from "./types";
import { emitScript } from "./codegen";

function isExecutorBlock(block: Block): block is ExecutorBlock {
  return block.type === "executor";
}

function isScenarioBlock(block: Block): block is ScenarioBlock {
  return block.type === "scenario";
}

function isStepBlock(block: Block): block is StepBlock {
  return block.type === "http-request" || block.type === "group" || block.type === "check";
}

function byParentId<T extends Block>(id: string) {
  return (value: T) => value.parent.type === "collection" && value.parent.id === id;
}

function toExecutor(block: ExecutorBlock): Executor {
  return block.executor;
}

function required<T>(value: T | undefined): T {
  if (value === undefined) {
    throw new Error("Value is required");
  }

  return value;
}

function toHttpRequestStep(block: HttpRequestBlock): HttpRequestStep {
  return {
    type: "http-request",
    name: block.name,
    method: block.method,
    url: block.url,
  };
}

function blocksToTest(blocks: Block[]): Test {
  const scenarios = blocks.filter(isScenarioBlock);
  const steps = blocks.filter(isStepBlock);
  const executors = blocks.filter(isExecutorBlock);

  function toStep(block: StepBlock): Step {
    switch (block.type) {
      case "check":
        return {
          type: "check",
          target: toHttpRequestStep(
            required(
              steps.find((step) => step.parent.type === "immediate" && step.parent.id === block.id),
            ) as HttpRequestBlock,
          ),
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

      case "http-request":
        return toHttpRequestStep(block);

      case "group":
        return {
          type: "group",
          name: block.name,
          steps: steps.filter(byParentId(block.id)).map(toStep),
        };

      default:
        return exhaustive(block);
    }
  }

  return {
    scenarios: scenarios.map((scenario) => {
      return {
        name: scenario.name,
        steps: steps.filter(byParentId(scenario.id)).map(toStep),
        executors: executors.filter(byParentId(scenario.id)).map(toExecutor),
      };
    }),
  };
}

function convertToScript(blockTest: BlockTest) {
  return emitScript(blocksToTest(blockTest.blocks));
}

export { convertToScript };
