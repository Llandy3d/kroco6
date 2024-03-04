import { OpenAPIV3 } from "openapi-types";

interface CanvasParent {
  type: "canvas";
  top: number;
  left: number;
}

interface ToolboxParent {
  type: "toolbox";
}

interface BlockParent {
  type: "block";
  id: string;
}

interface CollectionParent {
  type: "collection";
  ownerId: string;
  name: string;
}

type Parent = CanvasParent | ToolboxParent | BlockParent | CollectionParent;

interface BlockBase {
  id: string;
  parent: Parent;
}

interface ScenarioBlock extends BlockBase {
  type: "scenario";
  name: string;
}

interface StringParameter {
  type: "string";
  value: string;
}

interface NumberParameter {
  type: "number";
  value: number;
}

type HttpRequestParameter = StringParameter | NumberParameter;

interface HttpRequestBlock extends BlockBase {
  type: "http-request";
  name: string;
  method: string;
  url: string;
  parameters: {
    [name: string]: HttpRequestParameter;
  };
}

interface ConstantVusExecutor {
  type: "constant-vus";
  vus: number;
  duration: string;
}

type Executor = ConstantVusExecutor;

interface ExecutorBlock extends BlockBase {
  type: "executor";
  executor: Executor;
}

interface GroupBlock extends BlockBase {
  type: "group";
  name: string;
}

interface CheckBase {
  id: string;
}

interface StatusCheck extends CheckBase {
  type: "has-status";
  status: number;
}

interface BodyContainsCheck extends CheckBase {
  type: "body-contains";
  value: string;
}

type CheckExpression = StatusCheck | BodyContainsCheck;

interface CheckBlock extends BlockBase {
  type: "check";
  checks: CheckExpression[];
}

type Block = ScenarioBlock | GroupBlock | HttpRequestBlock | ExecutorBlock | CheckBlock;

type StepBlock = HttpRequestBlock | GroupBlock | CheckBlock;

function isBlock(value: unknown): value is Block {
  return typeof value === "object" && value !== null && "type" in value;
}

function isScenarioBlock(value: unknown): value is ScenarioBlock {
  return isBlock(value) && value.type === "scenario";
}

function isExecutorBlock(value: unknown): value is ExecutorBlock {
  return isBlock(value) && value.type === "executor";
}

function isStepBlock(value: unknown): value is StepBlock {
  if (!isBlock(value)) {
    return false;
  }

  return value.type === "group" || value.type === "check" || value.type === "http-request";
}

function isHttpRequestBlock(value: unknown): value is HttpRequestBlock {
  return isBlock(value) && value.type === "http-request";
}

function isRootBlock<T extends Block>(block: T): block is T & { parent: CanvasParent } {
  return block.parent.type === "canvas";
}

const STEPS: Array<StepBlock["type"]> = ["http-request", "group", "check"];

const EMPTY_LIBRARY: OpenAPIV3.Document = {
  info: {
    title: "Untitled API",
    version: "1.0.0",
  },
  openapi: "3.0.0",
  paths: {},
};

const EMPTY_BLOCK_TEST: BlockTest = {
  version: 0,
  library: EMPTY_LIBRARY,
  blocks: [],
};

interface BlockTest {
  version: 0;
  library: OpenAPIV3.Document | OpenAPIV3.Document;
  blocks: Block[];
}

const HTTP_METHODS = [
  OpenAPIV3.HttpMethods.GET,
  OpenAPIV3.HttpMethods.PUT,
  OpenAPIV3.HttpMethods.POST,
  OpenAPIV3.HttpMethods.DELETE,
  OpenAPIV3.HttpMethods.PATCH,
  OpenAPIV3.HttpMethods.HEAD,
  OpenAPIV3.HttpMethods.OPTIONS,
  OpenAPIV3.HttpMethods.TRACE,
];

interface ApiEndpoint {
  path: string;
  details: OpenAPIV3.PathItemObject;
  operations: ApiOperation[];
}

interface ApiOperation {
  path: string;
  method: OpenAPIV3.HttpMethods;
  details: OpenAPIV3.OperationObject;
}

export {};

export {
  isRootBlock,
  isBlock,
  isStepBlock,
  isExecutorBlock,
  isHttpRequestBlock,
  isScenarioBlock,
  STEPS,
  EMPTY_LIBRARY,
  EMPTY_BLOCK_TEST,
  HTTP_METHODS,
  type Parent,
  type ApiEndpoint,
  type ApiOperation,
  type Block,
  type ScenarioBlock,
  type HttpRequestBlock,
  type ExecutorBlock,
  type GroupBlock,
  type StepBlock,
  type BlockTest,
  type BlockParent,
  type CollectionParent,
  type CheckBlock,
  type CheckExpression,
  type CanvasParent,
  type ToolboxParent,
};
