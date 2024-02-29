import { exhaustive } from '../utils/typescript';
import type { ScenarioBlock, Block, ExecutorBlock, StepBlock } from './store/test/types';
import type { Executor, Step, Test } from './types';

function isExecutorBlock(block: Block): block is ExecutorBlock {
	return block.type === 'executor';
}

function isScenarioBlock(block: Block): block is ScenarioBlock {
	return block.type === 'scenario';
}

function isStepBlock(block: Block): block is StepBlock {
	return block.type === 'http-request' || block.type === 'group';
}

function byParentId<T extends Block>(id: string) {
	return (value: T) => value.parent.type === 'collection' && value.parent.id === id;
}

function toExecutor(block: ExecutorBlock): Executor {
	return block.executor;
}

export function blocksToTest(blocks: Block[]): Test {
	const scenarios = blocks.filter(isScenarioBlock);
	const steps = blocks.filter(isStepBlock);
	const executors = blocks.filter(isExecutorBlock);

	function toStep(block: StepBlock): Step {
		switch (block.type) {
			case 'http-request':
				return {
					type: 'http-request',
					name: block.name,
					method: block.method,
					url: Object.entries(block.parameters).reduce((url, [name, parameter]) => {
						return url.replace(`{${name}}`, parameter.value.toString());
					}, block.url)
				};

			case 'group':
				return {
					type: 'group',
					name: block.name,
					steps: steps.filter(byParentId(block.id)).map(toStep)
				};

			default:
				return exhaustive(block);
		}
	}

	return {
		scenarios: scenarios.map((scenario) => {
			return {
				name: scenario.name,
				steps: steps.filter(byParentId(scenario.id)).map(toStep),
				executors: executors.filter(byParentId(scenario.id)).map(toExecutor)
			};
		})
	};
}
