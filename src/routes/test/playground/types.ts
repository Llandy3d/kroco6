import type { Block } from '$lib/store/test/types';

export interface InsertBlockEvent {
	block: Block;
	index: number;
}
