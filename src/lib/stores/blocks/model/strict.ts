import {
  array,
  boolean,
  lazy,
  literal,
  merge,
  nullable,
  number,
  object,
  record,
  safeParse,
  string,
  union,
  type BaseSchema,
  type Output,
} from "valibot";
import { openapi } from "./openapi";

interface BlockBase {
  id: string;
}

interface ChainableBlock extends BlockBase {
  next: ChainableBlock | null;
}

const blockBase = object({
  id: string(),
});

interface GroupBlock extends ChainableBlock {
  type: "group";
  name: string;
  step: StepBlock | null;
  next: StepBlock | null;
}

const groupBlock: BaseSchema<GroupBlock> = merge([
  blockBase,
  object({
    type: literal("group"),
    name: string(),
    step: nullable(lazy(() => stepBlock)),
    next: nullable(lazy(() => stepBlock)),
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

interface HttpRequestBlock extends ChainableBlock {
  type: "http-request";
  name: string;
  url: string;
  method: string;
  parameters: Record<string, Parameter>;
  next: StepBlock | null;
}

const httpRequest: BaseSchema<HttpRequestBlock> = merge([
  blockBase,
  object({
    type: literal("http-request"),
    name: string(),
    method: string(),
    url: string(),
    parameters: record(parameter),
    next: nullable(lazy(() => stepBlock)),
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
  target: HttpRequestBlock;
  checks: Check[];
  next: StepBlock | null;
}

const checkBlock: BaseSchema<CheckBlock> = merge([
  blockBase,
  object({
    type: literal("check"),
    target: httpRequest,
    checks: array(check),
    next: nullable(lazy(() => stepBlock)),
  }),
]);

const stepBlock = union([groupBlock, httpRequest, checkBlock]);

type StepBlock = Output<typeof stepBlock>;

const constantVusExecutor = object({
  type: literal("constant-vus"),
  vus: number(),
  duration: string(),
});

const executor = union([constantVusExecutor]);

const executorBlock = merge([
  blockBase,
  object({
    type: literal("executor"),
    executor,
  }),
]);

type ExecutorBlock = Output<typeof executorBlock>;

const scenarioBlock = merge([
  blockBase,
  object({
    type: literal("scenario"),
    name: string(),
    step: nullable(stepBlock),
  }),
]);

type ScenarioBlock = Output<typeof scenarioBlock>;

const block = union([groupBlock, httpRequest, checkBlock, executorBlock, scenarioBlock]);

type Block = Output<typeof block>;

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

export {
  parse,
  type Block,
  type ChainableBlock,
  type Check,
  type CheckBlock,
  type ExecutorBlock,
  type GroupBlock,
  type HttpRequestBlock,
  type Root,
  type ScenarioBlock,
  type StepBlock,
  type Test,
};
