import type { Block } from "@/lib/stores/blocks/model/loose";
import { useDraggable } from "@dnd-kit/core";
import { createContext, useContext } from "react";

type UseDraggableReturn = ReturnType<typeof useDraggable>;

interface DraggingContext {
  isDragging: UseDraggableReturn["isDragging"];
  listeners: UseDraggableReturn["listeners"];
  attributes: Partial<UseDraggableReturn["attributes"]>;
  setNodeRef: UseDraggableReturn["setNodeRef"] | undefined;
}

const Context = createContext<DraggingContext>({
  isDragging: false,
  listeners: {},
  attributes: {},
  setNodeRef: undefined,
});

interface DraggableProps {
  block: Block;
  children: React.ReactNode;
}

function Draggable({ block, children }: DraggableProps) {
  const draggable = useDraggable({
    id: block.id,
    data: {
      block,
    },
  });

  return <Context.Provider value={draggable}>{children}</Context.Provider>;
}

function useDragging() {
  return useContext(Context);
}

export { Draggable, useDragging };
