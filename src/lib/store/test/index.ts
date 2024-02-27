import { derived, writable } from 'svelte/store';
import { type Block } from './types';

const blocks = writable<Block[]>([]);

const roots = derived(blocks, (blocks) => {
	return blocks.filter((block) => block.parent.type === 'canvas');
});

function appendBlock(owner: Block, block: Block) {
	blocks.update((blocks) => {
		return [
			...blocks.filter((current) => current.id !== block.id),
			{
				...block,
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
		return blocks.flatMap((current) => {
			if (current.id === block.id) {
				return [];
			}

			if (current.id !== before.id) {
				return [current];
			}

			const newBlock: Block = {
				...block,
				parent: {
					type: 'collection',
					id: owner.id
				}
			};

			return [newBlock, current];
		});
	});
}

export { appendBlock, insertBlock as insertBefore, blocks, roots };
