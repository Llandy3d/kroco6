interface CanvasParent {
	type: 'canvas';
	top: number;
	left: number;
}

interface CollectionParent {
	type: 'collection';
	id: string;
}

interface ToolboxParent {
	type: 'toolbox';
}

interface ImmediateParent {
	type: 'immediate';
	id: string;
}

type BlockParent = CanvasParent | CollectionParent | ToolboxParent | ImmediateParent;

interface BlockBase {
	id: string;
	parent: BlockParent;
}

interface ScenarioBlock extends BlockBase {
	type: 'scenario';
	name: string;
}

interface StringParameter {
	type: 'string';
	value: string;
}

interface NumberParameter {
	type: 'number';
	value: number;
}

type HttpRequestParameter = StringParameter | NumberParameter;

interface HttpRequestBlock extends BlockBase {
	type: 'http-request';
	name: string;
	method: string;
	url: string;
	parameters: {
		[name: string]: HttpRequestParameter;
	};
}

interface ConstantVusExecutor {
	type: 'constant-vus';
	vus: number;
	duration: string;
}

type Executor = ConstantVusExecutor;

interface ExecutorBlock extends BlockBase {
	type: 'executor';
	executor: Executor;
}

interface GroupBlock extends BlockBase {
	type: 'group';
	name: string;
}

interface CheckBase {
	id: string;
}

interface StatusCheck extends CheckBase {
	type: 'has-status';
	status: number;
}

interface BodyContainsCheck extends CheckBase {
	type: 'body-contains';
	value: string;
}

type CheckExpression = StatusCheck | BodyContainsCheck;

interface CheckBlock extends BlockBase {
	type: 'check';
	checks: CheckExpression[];
}

type Block = ScenarioBlock | GroupBlock | HttpRequestBlock | ExecutorBlock | CheckBlock;

type StepBlock = HttpRequestBlock | GroupBlock | CheckBlock;

function isRootBlock<T extends Block>(block: T): block is T & { parent: CanvasParent } {
	return block.parent.type === 'canvas';
}

const STEPS: Array<StepBlock['type']> = ['http-request', 'group', 'check'];

interface BlockDocument {
	version: 0;
	blocks: Block[];
}

export {
	isRootBlock,
	STEPS,
	type Block,
	type ScenarioBlock,
	type HttpRequestBlock,
	type ExecutorBlock,
	type GroupBlock,
	type StepBlock,
	type BlockDocument,
	type BlockParent,
	type ImmediateParent,
	type CheckBlock,
	type CheckExpression
};
