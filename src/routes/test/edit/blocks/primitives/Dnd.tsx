import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent,
  type ReactNode,
} from "react";

interface Dragging<T> {
  data: T;
  node: HTMLElement;
  bounds: DOMRect;
  top: number;
  left: number;
  accepts: (data: unknown) => boolean;
}

interface DndContext {
  dragging: Dragging<unknown> | null;
  setDragging: (dragging: Dragging<unknown> | null) => void;
}

const Context = createContext<DndContext | null>(null);

function useDndContext() {
  const dnd = useContext(Context);

  if (!dnd) {
    throw new Error("useDndContext must be used within a DndProvider");
  }

  return dnd;
}

interface DragOptions<T> {
  enabled?: boolean;
  data: T;
  accepts: (data: unknown) => boolean;
}

function useDrag<T>({ enabled = true, data, accepts }: DragOptions<T>) {
  const context = useDndContext();
  const draggable = useRef<HTMLElement | null>(null);

  const [dragging, setDragging] = useState(false);

  function onMouseDown(ev: MouseEvent) {
    if (draggable.current === null) {
      return;
    }

    draggable.current.draggable = true;

    ev.stopPropagation();
  }

  function onMouseUp(ev: MouseEvent<HTMLElement>) {
    if (draggable.current === null) {
      return;
    }

    draggable.current.draggable = false;

    ev.stopPropagation();
  }

  function onDragStart(ev: DragEvent<HTMLElement>) {
    if (draggable.current === null) {
      return;
    }

    const bounds = draggable.current.getBoundingClientRect();

    context.setDragging({
      data,
      node: draggable.current,
      bounds,
      top: ev.clientY - bounds.top,
      left: ev.clientX - bounds.left,
      accepts,
    });

    ev?.stopPropagation();

    setDragging(true);
  }

  function onDragEnd() {
    if (draggable.current === null) {
      return;
    }

    draggable.current.draggable = false;

    context.setDragging(null);

    setDragging(false);
  }

  function setDraggableRef(ref: HTMLElement | null) {
    if (ref === null) {
      return;
    }

    draggable.current = ref;
  }

  return {
    dragging,
    events: enabled ? { onMouseDown, onMouseUp, onDragStart, onDragEnd } : {},
    setDraggableRef,
  };
}

interface DropEvent<T, D> {
  top: number;
  left: number;
  data: {
    target: T;
    dropped: D;
  };
}

interface DropOptions<T, D> {
  data: T;
  accepts: (data: unknown) => data is D;
  onDrop: (ev: DropEvent<T, D>) => void;
}

function useDrop<T, D>({ data, accepts, onDrop: handleOnDrop }: DropOptions<T, D>) {
  const context = useDndContext();

  const dropEl = useRef<HTMLElement | null>(null);

  const [dropping, setDropping] = useState(false);

  function isAcceptable(dragging: Dragging<unknown> | null): dragging is Dragging<D> {
    if (dragging === null) {
      return false;
    }

    return dragging.accepts(data) && accepts(dragging.data);
  }

  function onDragOver(ev: DragEvent) {
    if (!isAcceptable(context.dragging)) {
      return;
    }

    setDropping(true);

    ev.preventDefault();
    ev.stopPropagation();
  }

  function onDragLeave() {
    setDropping(false);
  }

  function onDrop(ev: DragEvent) {
    if (dropEl.current === null || !isAcceptable(context.dragging)) {
      return;
    }

    ev.preventDefault();
    ev.stopPropagation();

    const bounds = dropEl.current.getBoundingClientRect();

    handleOnDrop({
      top: ev.clientY - bounds.top - context.dragging.top,
      left: ev.clientX - bounds.left - context.dragging.left,
      data: {
        dropped: context.dragging.data,
        target: data,
      },
    });

    setDropping(false);
  }

  function setDropRef(ref: HTMLElement | null) {
    if (ref === null) {
      return;
    }

    dropEl.current = ref;
  }

  useEffect(() => {
    console.log("dropping", dropping);
  }, [dropping]);

  return {
    setDropRef,
    dragging: context.dragging,
    dropping,
    accepting: isAcceptable(context.dragging),
    events: { onDragOver, onDragLeave, onDrop },
  };
}

interface DndProviderProps {
  children: ReactNode;
}

function DndProvider({ children }: DndProviderProps) {
  const [dragging, setDragging] = useState<Dragging<unknown> | null>(null);

  const value = useMemo(() => ({ dragging, setDragging }), [dragging]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export { DndProvider, useDrag, useDrop, type DropEvent };
