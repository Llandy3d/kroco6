interface CanvasParent {
	type: 'canvas';
	top: number;
	left: number;
}

interface CollectionParent {
	type: 'collection';
	id: string;
}

interface BlockBase {
	id: string;
	parent: CanvasParent | CollectionParent;
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

type Block = ScenarioBlock | GroupBlock | HttpRequestBlock | ExecutorBlock;

type Step = HttpRequestBlock | GroupBlock;

function isRootBlock<T extends Block>(block: T): block is T & { parent: CanvasParent } {
	return block.parent.type === 'canvas';
}

const STEPS: Array<Step['type']> = ['http-request', 'group'];

export {
	isRootBlock,
	STEPS,
	type Block,
	type ScenarioBlock,
	type HttpRequestBlock,
	type ExecutorBlock,
	type GroupBlock
};
