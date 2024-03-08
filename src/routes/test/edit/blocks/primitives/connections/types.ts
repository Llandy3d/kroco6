import type { Block } from "@/lib/stores/blocks/model/loose";

interface TopConnection {
  accepts: (value: Block) => boolean;
}

interface BottomConnection<T extends Block> {
  block: T | null;
  accepts: (value: Block) => value is T;
  onDrop: (value: T) => void;
}

export { type BottomConnection, type TopConnection };
