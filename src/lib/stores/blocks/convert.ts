import type { Environment } from "@/lib/backend-client";
import type { Check, HttpRequestStep, Scenario, Step, Test } from "@/lib/types";
import { exhaustive } from "@/lib/utils/typescript";
import { emitScript } from "./codegen";
import type * as loose from "./model/loose";
import type * as model from "./model/strict";
import { parse } from "./model/strict";
import { isScenarioBlock } from "./utils";

function* enumerate(start: model.StepBlock | null): Generator<model.StepBlock> {
  let current = start;

  while (current !== null) {
    yield current;

    current = current.next;
  }
}

function toHttpRequestStep(model: model.LibraryBlock | model.HttpRequestBlock): HttpRequestStep {
  return {
    type: "http-request",
    name: model.name,
    method: model.method,
    url: model.url,
  };
}

function toCheck(model: model.Check): Check {
  switch (model.type) {
    case "status":
      return {
        type: "has-status",
        status: model.value,
      };

    case "contains":
      return {
        type: "body-contains",
        value: model.value,
      };
  }
}

function toStep(model: model.StepBlock): Step {
  switch (model.type) {
    case "group":
      return {
        type: "group",
        name: model.name,
        steps: [...enumerate(model.step)].map(toStep),
      };

    case "check":
      return {
        type: "check",
        target: toHttpRequestStep(model.target),
        checks: model.checks.map(toCheck),
      };

    case "http-request":
      return toHttpRequestStep(model);

    case "library":
      return toHttpRequestStep(model);

    case "sleep":
      return {
        type: "sleep",
        seconds: model.seconds,
      };

    default:
      return exhaustive(model);
  }
}

function toScenario(model: model.ScenarioBlock): Scenario {
  return {
    name: model.name,
    executor: model.executor.executor,
    steps: [...enumerate(model.step)].map(toStep),
  };
}

function convertToTest(model: model.Test): Test {
  const scenarios = model.roots.map((root) => root.block).filter(isScenarioBlock);

  return {
    scenarios: scenarios.map(toScenario),
  };
}

function convertToScript(env: Environment, test: loose.Test) {
  const scenarioRoots = {
    ...test,
    roots: test.roots.filter((root) => isScenarioBlock(root.block)),
  };

  const strict = parse(scenarioRoots);

  if (!strict.success) {
    throw new Error("Failed to parse the test.");
  }

  return emitScript(env, convertToTest(strict.output));
}

export { convertToScript };
