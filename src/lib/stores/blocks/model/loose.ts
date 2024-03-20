import { nameValuePair, type NameValuePair } from "@/lib/stores/blocks/model/generic";
import { nanoid } from "nanoid";
import {
  array,
  boolean,
  lazy,
  literal,
  merge,
  nullable,
  number,
  object,
  optional,
  record,
  safeParse,
  string,
  union,
  type BaseSchema,
  type Output,
} from "valibot";
import { openapi } from "./openapi";

const template = Symbol("This block is a template and should be cloned before use.");

type WithTemplate<T> = T & {
  [template]?: true;
};

interface BlockBase {
  [template]?: boolean;
  id: string;
}

interface ChainableBlock extends BlockBase {
  next: Block | null;
}

const blockBase = object({
  id: string(),
  [template]: optional(boolean()),
});

interface GroupBlock extends ChainableBlock {
  type: "group";
  name: string;
  step: Block | null;
  next: Block | null;
}

const groupBlock: BaseSchema<GroupBlock> = merge([
  blockBase,
  object({
    type: literal("group"),
    name: string(),
    step: nullable(lazy(() => block)),
    next: nullable(lazy(() => block)),
  }),
]);

const stringParameter = object({
  type: literal("string"),
  value: string(),
});

const numberParameter = object({
  type: literal("number"),
  value: number(),
});

const booleanParameter = object({
  type: literal("boolean"),
  value: boolean(),
});

const parameter = union([stringParameter, numberParameter, booleanParameter]);

type Parameter = Output<typeof parameter>;

interface LibraryBlock extends ChainableBlock {
  type: "library";
  name: string;
  url: string;
  method: string;
  parameters: Record<string, Parameter>;
  next: Block | null;
}

const libraryBlock: BaseSchema<LibraryBlock> = merge([
  blockBase,
  object({
    type: literal("library"),
    name: string(),
    method: string(),
    url: string(),
    parameters: record(parameter),
    next: nullable(lazy(() => block)),
  }),
]);

interface HttpRequestBlock extends ChainableBlock {
  type: "http-request";
  name: string;
  url: string;
  method: string;
  parameters: NameValuePair[];
  headers: NameValuePair[];
  next: Block | null;
}

const httpRequestBlock: BaseSchema<HttpRequestBlock> = merge([
  blockBase,
  object({
    type: literal("http-request"),
    name: string(),
    method: string(),
    url: string(),
    parameters: array(nameValuePair),
    headers: array(nameValuePair),
    next: nullable(lazy(() => block)),
  }),
]);

const checkBase = object({
  id: string(),
});

const statusCheck = merge([
  checkBase,
  object({
    type: literal("status"),
    value: number(),
  }),
]);

const containsCheck = merge([
  checkBase,
  object({
    type: literal("contains"),
    value: string(),
  }),
]);

const check = union([statusCheck, containsCheck]);

type Check = Output<typeof check>;

interface CheckBlock extends ChainableBlock {
  type: "check";
  target: Block | null;
  checks: Check[];
  next: Block | null;
}

const checkBlock: BaseSchema<CheckBlock> = merge([
  blockBase,
  object({
    type: literal("check"),
    target: nullable(lazy(() => block)),
    checks: array(check),
    next: nullable(lazy(() => block)),
  }),
]);

interface SleepBlock extends ChainableBlock {
  type: "sleep";
  seconds: number;
  next: Block | null;
}

const sleepBlock: BaseSchema<SleepBlock> = merge([
  blockBase,
  object({
    type: literal("sleep"),
    seconds: number(),
    next: nullable(lazy(() => block)),
  }),
]);

const stepBlock = union([groupBlock, libraryBlock, checkBlock, sleepBlock, httpRequestBlock]);

type StepBlock = Output<typeof stepBlock>;

const constantVusExecutor = object({
  type: literal("constant-vus"),
  vus: number(),
  duration: string(),
});

const executor = union([constantVusExecutor]);

type Executor = Output<typeof executor>;

interface ExecutorBlock extends BlockBase {
  type: "executor";
  executor: Executor;
}

const executorBlock: BaseSchema<ExecutorBlock> = merge([
  blockBase,
  object({
    type: literal("executor"),
    executor,
  }),
]);

interface ScenarioBlock extends BlockBase {
  type: "scenario";
  name: string;
  executor: Block | null;
  step: Block | null;
}

const scenarioBlock: BaseSchema<ScenarioBlock> = merge([
  blockBase,
  object({
    type: literal("scenario"),
    name: string(),
    executor: nullable(lazy(() => block)),
    step: nullable(lazy(() => block)),
  }),
]);

const block = union([
  groupBlock,
  libraryBlock,
  checkBlock,
  executorBlock,
  scenarioBlock,
  sleepBlock,
  httpRequestBlock,
]);

type Block = Output<typeof block>;

type Chainable = Extract<Block, ChainableBlock>;

const root = object({
  type: literal("root"),
  top: number(),
  left: number(),
  block: block,
});

type Root = Output<typeof root>;

const test = object({
  library: openapi,
  roots: array(root),
});

type Test = Output<typeof test>;

// The strict schema is used when trying to convert the blocks to a test and should
// always represent a _valid_ test. The loose schema is used when working with the
// blocks in the editor where the user can make mistakes.
function parse(data: unknown) {
  return safeParse(test, data);
}

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
  parse,
  type Block,
  type Chainable,
  type ChainableBlock,
  type Check,
  type CheckBlock,
  type ExecutorBlock,
  type GroupBlock,
  type HttpRequestBlock,
  type LibraryBlock,
  type NameValuePair,
  type Root,
  type ScenarioBlock,
  type SleepBlock,
  type StepBlock,
  type Test,
};
