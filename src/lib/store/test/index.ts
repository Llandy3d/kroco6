import { derived, writable } from 'svelte/store';
import { type Block, type BlockParent, type HttpRequestBlock } from './types';
import { nanoid } from 'nanoid';
import type { OpenAPIV3_1 } from 'openapi-types';
import { isTruthy } from '../../../utils/typescript';

type Falsy = '' | 0 | false | null | undefined;

const api = writable<OpenAPIV3_1.Document>({
	info: {
		title: 'Untitled API',
		version: '1.0.0'
	},
	openapi: '3.0.0',
	paths: {}
});

const requests = derived(api, ($api) => {
	return Object.entries($api.paths ?? {}).flatMap(([path, methods]) => {
		if (methods === undefined) {
			return [];
		}

		const a: Array<HttpRequestBlock | Falsy> = [
			methods.get && {
				type: 'http-request',
				id: nanoid(),
				method: 'get',
				url: path,
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

const selected = writable<Block | null>(null);

const blocks = writable<Block[]>([]);

const roots = derived(blocks, (blocks) => {
	return blocks.filter((block) => block.parent.type === 'canvas');
});

function instantiateBlock(block: Block) {
	return block.parent.type === 'toolbox' ? { ...block, id: nanoid() } : block;
}

function updateInFile(callback: (blocks: Block[]) => Block[]) {
	blocks.update((blocks) => {
		return callback(blocks);
	});
}

function appendBlock(owner: Block, block: Block) {
	updateInFile((blocks) => {
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
	updateInFile((blocks) => {
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
	updateInFile((blocks) => {
		return blocks.map((current) => (current.id === block.id ? block : current));
	});
}

function deleteBlock(block: Block | null) {
	if (block === null) {
		return;
	}

	updateInFile((blocks) => {
		const newChildren = blocks.map((current) =>
			current.parent.type === 'collection' && current.parent.id === block.id
				? { ...current, parent: block.parent }
				: current
		);

		return newChildren.filter((current) => current.id !== block?.id);
	});
}

function reparentBlock(parent: BlockParent, block: Block) {
	updateInFile((blocks) => {
		if (block.parent.type === 'toolbox') {
			const newBlock = instantiateBlock(block);

			return [...blocks, { ...newBlock, parent }];
		}

		return blocks.map((current) => (current.id === block.id ? { ...block, parent } : current));
	});
}

function loadBlocks(newBlocks: Block[]) {
	blocks.set(newBlocks);
}

export {
	instantiateBlock,
	appendBlock,
	insertBlock,
	reparentBlock,
	updateBlock,
	deleteBlock,
	loadBlocks,
	selected,
	api,
	blocks,
	requests,
	roots
};
