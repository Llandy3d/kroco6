interface CanvasParent {
	type: 'canvas';
	top: number;
	left: number;
}

interface CollectionParent {
	type: 'collection';
	id: string;
}

interface Block {
	id: string;
	text: string;
	parent: CanvasParent | CollectionParent;
}

interface RootBlock extends Block {
	parent: CanvasParent;
}

function isRootBlock(block: Block): block is RootBlock {
	return block.parent.type === 'canvas';
}

export { isRootBlock, type Block, type RootBlock };
