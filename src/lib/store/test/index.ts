import { derived, writable } from 'svelte/store';
import { type Block } from './types';
import { nanoid } from 'nanoid';

const blocks = writable<Block[]>([]);

const roots = derived(blocks, (blocks) => {
	return blocks.filter((block) => block.parent.type === 'canvas');
});

function instantiateBlock(block: Block) {
	return block.parent.type === 'toolbox' ? { ...block, id: nanoid() } : block;
}

function appendBlock(owner: Block, block: Block) {
	blocks.update((blocks) => {
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
	blocks.update((blocks) => {
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

export { instantiateBlock, appendBlock, insertBlock, blocks, roots };
