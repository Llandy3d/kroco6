interface StatusCheck {
  type: "has-status";
  status: number;
}

interface BodyContainsCheck {
  type: "body-contains";
  value: string;
}

type Check = StatusCheck | BodyContainsCheck;

interface CheckStep {
  type: "check";
  target: HttpRequestStep;
  checks: Check[];
}

interface GroupStep {
  type: "group";
  name: string;
  steps: Step[];
}

interface SleepStep {
  type: "sleep";
  seconds: number;
}

interface HttpRequestStep {
  type: "http-request";
  name: string;
  method: string;
  url: string;
}

type Step = GroupStep | HttpRequestStep | CheckStep | SleepStep;

interface ConstantVusExecutor {
  type: "constant-vus";
  vus: number;
  duration: string;
}

interface RampingVusExecutor {
  type: "ramping-vus";
  stages: Array<{
    target: string;
    duration: string;
  }>;
  duration: string;
}

type Executor = ConstantVusExecutor | RampingVusExecutor;

interface Scenario {
  name: string;
  executor: Executor;
  steps: Step[];
}

interface Test {
  scenarios: Scenario[];
}

export type {
  BodyContainsCheck,
  CheckStep,
  Executor,
  GroupStep,
  HttpRequestStep,
  Scenario,
  StatusCheck,
  Step,
  Test,
};
