import { derived, writable } from 'svelte/store';
import { isRootBlock, type Block } from './types';

const blocks = writable<Block[]>([]);

const roots = derived(blocks, (blocks) => {
	return blocks.filter(isRootBlock);
});

export { blocks, roots };
