import { derived, writable as readable, writable } from "svelte/store";
import {
  type Block,
  type BlockTest,
  EMPTY_BLOCK_TEST,
  type ApiEndpoint,
  isStepBlock,
  type Parent,
} from "./types";
import { nanoid } from "nanoid";
import type { OpenAPIV3 } from "openapi-types";

const blockTest = writable<BlockTest>(EMPTY_BLOCK_TEST);

const selected = readable<Block | null>(null);

const blocks = derived(blockTest, (test) => test.blocks);
const steps = derived(blocks, (blocks) => blocks.filter(isStepBlock));

const roots = derived(blocks, (blocks) => {
  return blocks.filter((block) => block.parent.type === "canvas");
});

const library = derived(blockTest, (test) => test.library);

function byBlockParent<T extends Block>(id: string) {
  return (blocks: T[]) => {
    return blocks.find((block) => block.parent.type === "block" && block.parent.id === id) ?? null;
  };
}

function byCollectionParent<T extends Block>(blockId: string, name: string) {
  return (blocks: T[]) => {
    return (
      blocks.find(
        (block) =>
          block.parent.type === "collection" &&
          block.parent.ownerId === blockId &&
          block.parent.name === name,
      ) ?? null
    );
  };
}

function updateInBlocks(fn: (blocks: Block[]) => Block[]) {
  blockTest.update((test) => {
    return {
      ...test,
      blocks: fn(test.blocks),
    };
  });
}

function updateBlock(target: Block) {
  updateInBlocks((blocks) => {
    return blocks.map((block) => (block.id === target.id ? target : block));
  });
}

function instantiateBlock(block: Block) {
  return block.parent.type === "toolbox" ? { ...block, id: nanoid() } : block;
}

function deleteBlock(target: Block) {
  updateInBlocks((blocks) => {
    return blocks.filter((block) => block.id !== target.id);
  });
}

function reparentBlock(parent: Parent, target: Block) {
  updateInBlocks((blocks) => {
    const newBlock = {
      ...instantiateBlock(target),
      parent,
    };

    if (target.parent.type === "toolbox") {
      return [...blocks, newBlock];
    }

    return blocks.map((block) => {
      if (block.id === target.id) {
        return {
          ...block,
          parent: parent,
        };
      }

      return block;
    });
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
  updateBlock,
  deleteBlock,
  reparentBlock,
  byBlockParent,
  instantiateBlock,
  byCollectionParent,
  syncLibrary,
  loadBlockTest,
  updateEndpoint,
  steps,
  selected,
  blockTest,
  library,
  blocks,
  roots,
};
