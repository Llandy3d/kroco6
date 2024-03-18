import type { Block } from "@/lib/stores/blocks/model/loose";
import type { DropAction } from "@/routes/test/edit/blocks/dnd/types";
import type { ReactNode } from "react";

interface TopConnection {
  accepts: (value: Block) => boolean;
}

interface Connection {
  key: string;
  node: ReactNode;
  connected: boolean;
  action: DropAction;
  accepts: (value: unknown) => boolean;
}

export { type Connection, type TopConnection };
