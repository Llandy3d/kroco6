interface StatusCheck {
	type: 'has-status';
	status: number;
}

interface BodyContainsCheck {
	type: 'body-contains';
	value: string;
}

type Check = StatusCheck | BodyContainsCheck;

interface CheckStep {
	type: 'check';
	target: HttpRequestStep;
	checks: Check[];
}

interface GroupStep {
	type: 'group';
	name: string;
	steps: Step[];
}

interface HttpRequestStep {
	type: 'http-request';
	name: string;
	method: string;
	url: string;
}

type Step = GroupStep | HttpRequestStep | CheckStep;

interface ConstantVusExecutor {
	type: 'constant-vus';
	vus: number;
	duration: string;
}

interface RampingVusExecutor {
	type: 'ramping-vus';
	stages: Array<{
		target: string;
		duration: string;
	}>;
	duration: string;
}

type Executor = ConstantVusExecutor | RampingVusExecutor;

interface Scenario {
	name: string;
	executors: Executor[];
	steps: Step[];
}

interface Test {
	scenarios: Scenario[];
}

export type {
	Test,
	Scenario,
	Step,
	Executor,
	HttpRequestStep,
	GroupStep,
	CheckStep,
	StatusCheck,
	BodyContainsCheck
};
