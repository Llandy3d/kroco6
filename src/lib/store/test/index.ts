import { derived, writable as readable, writable } from "svelte/store";
import {
  type Block,
  type BlockTest,
  type BlockParent,
  EMPTY_BLOCK_TEST,
  type ApiEndpoint,
} from "./types";
import { nanoid } from "nanoid";
import type { OpenAPIV3 } from "openapi-types";

const blockTest = writable<BlockTest>(EMPTY_BLOCK_TEST);

const selected = readable<Block | null>(null);

const blocks = derived(blockTest, (test) => test.blocks);
const library = derived(blockTest, (test) => test.library);

const roots = derived(blocks, (blocks) => {
  return blocks.filter((block) => block.parent.type === "canvas");
});

function instantiateBlock(block: Block) {
  return block.parent.type === "toolbox" ? { ...block, id: nanoid() } : block;
}

function updateBlocksInTest(callback: (blocks: Block[]) => Block[]) {
  blockTest.update((test) => {
    return {
      ...test,
      blocks: callback(test.blocks),
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
          type: "collection",
          id: owner.id,
        },
      },
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
          type: "collection",
          id: owner.id,
        },
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
      current.parent.type === "collection" && current.parent.id === block.id
        ? { ...current, parent: block.parent }
        : current,
    );

    return newChildren.filter((current) => current.id !== block?.id);
  });
}

function reparentBlock(parent: BlockParent, block: Block) {
  updateBlocksInTest((blocks) => {
    if (block.parent.type === "toolbox") {
      const newBlock = instantiateBlock(block);

      return [...blocks, { ...newBlock, parent }];
    }

    return blocks.map((current) => (current.id === block.id ? { ...block, parent } : current));
  });
}

function syncLibrary(library: OpenAPIV3.Document) {
  blockTest.update((test) => {
    return {
      ...test,
      library,
    };
  });
}

function loadBlockTest(test: BlockTest) {
  blockTest.set(test);
}

function updateInPaths(fn: (operation: OpenAPIV3.PathsObject) => OpenAPIV3.PathsObject) {
  blockTest.update((test) => {
    return {
      ...test,
      library: {
        ...test.library,
        paths: fn(test.library.paths),
      },
    };
  });
}

function updateEndpoint(previous: ApiEndpoint, next: ApiEndpoint) {
  updateInPaths((paths) => {
    return Object.entries(paths).reduce((acc, [path, details]) => {
      const isRenamed = path === previous.path && previous.path !== next.path;

      if (isRenamed || path === next.path) {
        return { ...acc, [next.path]: next.details };
      }

      return { ...acc, [path]: details };
    }, {} as OpenAPIV3.PathsObject);
  });
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
  updateEndpoint,
  selected,
  blockTest,
  library,
  blocks,
  roots,
};
