import type { Block } from "$lib/stores/test/types";

interface TopConnection {
  accepts: (value: Block) => boolean;
}

interface BottomConnection<T extends Block> {
  block: T | null;
  accepts: (value: Block) => value is T;
}

export { type TopConnection, type BottomConnection };
