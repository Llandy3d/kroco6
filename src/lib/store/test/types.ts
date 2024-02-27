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

type Block = ScenarioBlock | HttpRequestBlock | ExecutorBlock;

function isRootBlock<T extends Block>(block: T): block is T & { parent: CanvasParent } {
	return block.parent.type === 'canvas';
}

export { isRootBlock, type Block, type ScenarioBlock, type HttpRequestBlock, type ExecutorBlock };
