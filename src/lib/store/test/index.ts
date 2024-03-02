import { derived, writable as readable, writable } from 'svelte/store';
import {
	type Block,
	type BlockTest,
	type BlockParent,
	type HttpRequestBlock,
	EMPTY_BLOCK_TEST
} from './types';
import { nanoid } from 'nanoid';
import { isTruthy } from '../../utils/typescript';
import type { OpenAPIV3_1 } from 'openapi-types';

type Falsy = '' | 0 | false | null | undefined;

const blockTest = writable<BlockTest>(EMPTY_BLOCK_TEST);

const requests = derived(blockTest, ($test) => {
	const baseUrl = $test.library.servers?.[0]?.url ?? '';

	return Object.entries($test.library.paths ?? {}).flatMap(([path, methods]) => {
		if (methods === undefined) {
			return [];
		}

		const a: Array<HttpRequestBlock | Falsy> = [
			methods.get && {
				type: 'http-request',
				id: nanoid(),
				method: 'get',
				url: new URL(path, baseUrl).toString(),
				name: methods.get.summary ?? `GET ${path}`,
				parameters: {},
				parent: { type: 'toolbox' }
			},
			methods.post && {
				type: 'http-request',
				id: nanoid(),
				method: 'post',
				url: path,
				name: methods.post.summary ?? `POST ${path}`,
				parameters: {},
				parent: { type: 'toolbox' }
			}
		];

		return a.filter(isTruthy);
	});
});

const selected = readable<Block | null>(null);

const blocks = derived(blockTest, (test) => test.blocks);
const library = derived(blockTest, (test) => test.library);

const roots = derived(blocks, (blocks) => {
	return blocks.filter((block) => block.parent.type === 'canvas');
});

function instantiateBlock(block: Block) {
	return block.parent.type === 'toolbox' ? { ...block, id: nanoid() } : block;
}

function updateBlocksInTest(callback: (blocks: Block[]) => Block[]) {
	blockTest.update((test) => {
		return {
			...test,
			blocks: callback(test.blocks)
		};
	});
}

function appendBlock(owner: Block, block: Block) {
	updateBlocksInTest((blocks) => {
		const target = instantiateBlock(block);

		return [
			...blocks.filter((current) => current.id !== target.id),
			{
				...target,
				parent: {
					type: 'collection',
					id: owner.id
				}
			}
		];
	});
}

function insertBlock(owner: Block, before: Block, block: Block) {
	updateBlocksInTest((blocks) => {
		const target = instantiateBlock(block);

		return blocks.flatMap((current) => {
			if (current.id === target.id) {
				return [];
			}

			if (current.id !== before.id) {
				return [current];
			}

			const newBlock: Block = {
				...target,
				parent: {
					type: 'collection',
					id: owner.id
				}
			};

			return [newBlock, current];
		});
	});
}

function updateBlock(block: Block) {
	updateBlocksInTest((blocks) => {
		return blocks.map((current) => (current.id === block.id ? block : current));
	});
}

function deleteBlock(block: Block | null) {
	if (block === null) {
		return;
	}

	updateBlocksInTest((blocks) => {
		const newChildren = blocks.map((current) =>
			current.parent.type === 'collection' && current.parent.id === block.id
				? { ...current, parent: block.parent }
				: current
		);

		return newChildren.filter((current) => current.id !== block?.id);
	});
}

function reparentBlock(parent: BlockParent, block: Block) {
	updateBlocksInTest((blocks) => {
		if (block.parent.type === 'toolbox') {
			const newBlock = instantiateBlock(block);

			return [...blocks, { ...newBlock, parent }];
		}

		return blocks.map((current) => (current.id === block.id ? { ...block, parent } : current));
	});
}

function syncLibrary(library: OpenAPIV3_1.Document) {
	blockTest.update((test) => {
		return {
			...test,
			library
		};
	});
}

function loadBlockTest(test: BlockTest) {
	blockTest.set(test);
}

export {
	instantiateBlock,
	appendBlock,
	insertBlock,
	reparentBlock,
	updateBlock,
	deleteBlock,
	syncLibrary,
	loadBlockTest,
	selected,
	blockTest,
	library,
	blocks,
	requests,
	roots
};
