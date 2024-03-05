import type { Block, HttpRequestBlock, ScenarioBlock, StepBlock } from "./model/strict";

function isBlock(value: unknown): value is Block {
  return typeof value === "object" && value !== null && "type" in value;
}

function isScenarioBlock(value: unknown): value is ScenarioBlock {
  if (!isBlock(value)) {
    return false;
  }

  return value.type === "scenario";
}

function isStepBlock(value: unknown): value is StepBlock {
  if (!isBlock(value)) {
    return false;
  }

  return value.type === "check" || value.type === "group" || value.type === "http-request";
}

function isHttpRequestBlock(value: unknown): value is HttpRequestBlock {
  if (!isBlock(value)) {
    return false;
  }

  return value.type === "http-request";
}

export { isBlock, isHttpRequestBlock, isScenarioBlock, isStepBlock };
