/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ActionReturn } from "svelte/action";
import { writable } from "svelte/store";

type AcceptsCallback<T = unknown> = (value: unknown) => value is T;

const dragging = writable<DragSource<any> | null>(null);

interface DragSource<T = unknown> {
  accepts: (value: unknown) => boolean;
  node: HTMLElement;
  top: number;
  left: number;
  data: T;
}

interface DraggableOptions<T> {
  data: T;
  accepts: (value: unknown) => boolean;
  transform?: (data: T) => T;
}

interface DraggableAttributes {
  "on:dragchange"?: (dragging: CustomEvent<DragChangeEvent>) => void;
}

function draggable<T>(
  node: HTMLElement,
  options: DraggableOptions<T>,
): ActionReturn<DraggableOptions<T>, DraggableAttributes> {
  let { accepts, data, transform } = options;

  const handle = node.querySelector<HTMLElement>("[data-drag-handle]") ?? node;

  const handleMouseDown = (event: MouseEvent) => {
    node.draggable = true;

    event.stopPropagation();
  };

  const handleMouseUp = (event: MouseEvent) => {
    node.draggable = false;

    event.stopPropagation();
  };

  const handleDragStart = (event: DragEvent) => {
    if (event.dataTransfer === null) {
      return;
    }

    const bounds = node.getBoundingClientRect();

    const payload: DragSource<T> = {
      node,
      top: event.clientY - bounds.top,
      left: event.clientX - bounds.left,
      data: transform?.(data) ?? data,
      accepts,
    };

    event.dataTransfer.setData("application/json", JSON.stringify(payload));
    event.dataTransfer.effectAllowed = "all";

    dragging.set(payload);

    node.dispatchEvent(
      new CustomEvent<DragChangeEvent>("dragchange", {
        detail: {
          dragging: true,
        },
      }),
    );

    event.stopPropagation();
  };

  const handleDragEnd = () => {
    node.draggable = false;

    dragging.set(null);

    node.dispatchEvent(
      new CustomEvent<DragChangeEvent>("dragchange", {
        detail: {
          dragging: false,
        },
      }),
    );
  };

  node.addEventListener("dragstart", handleDragStart);
  node.addEventListener("dragend", handleDragEnd);

  handle.addEventListener("mousedown", handleMouseDown);
  handle.addEventListener("mouseup", handleMouseUp);

  return {
    update(options) {
      data = options.data;
      accepts = options.accepts;
      transform = options.transform;
    },
    destroy() {
      node.removeEventListener("dragstart", handleDragStart);
      node.removeEventListener("dragend", handleDragEnd);

      handle.removeEventListener("mousedown", handleMouseDown);
      handle.removeEventListener("mouseup", handleMouseUp);
    },
  };
}

interface DropZoneOptions<Data, Accepts> {
  data: Data;
  accepts: (value: unknown) => value is Accepts;
}

interface DragChangeEvent {
  dragging: boolean;
}

interface AcceptingEvent<Accepts> {
  source: DragSource<Accepts> | null;
  accepting: boolean;
}

interface DroppingEvent<Accepts> {
  source: DragSource<Accepts> | null;
  dropping: boolean;
}

interface DroppedEvent<Dropped = unknown, Target = unknown> {
  data: {
    dropped: Dropped;
    target: Target;
  };
  top: number;
  left: number;
}

interface DropZoneAttributes<TargetData, Accepts> {
  "on:dropped": (event: CustomEvent<DroppedEvent<Accepts, TargetData>>) => void;
  "on:accepting"?: (event: CustomEvent<AcceptingEvent<Accepts>>) => void;
  "on:dropping"?: (event: CustomEvent<DroppingEvent<Accepts>>) => void;
}

function dropzone<TargetData, Accepts>(
  node: HTMLElement,
  options: DropZoneOptions<TargetData, Accepts>,
): ActionReturn<DropZoneOptions<TargetData, Accepts>, DropZoneAttributes<TargetData, Accepts>> {
  let source: DragSource<any> | null = null;

  let { accepts, data: target } = options;

  const isAcceptable = (source: DragSource<unknown> | null): source is DragSource<Accepts> => {
    if (source === null) {
      return false;
    }

    return source.accepts(target) && accepts(source.data);
  };

  const handleDragEnter = () => {
    if (!isAcceptable(source)) {
      return;
    }

    node.dispatchEvent(
      new CustomEvent<DroppingEvent<Accepts>>("dropping", {
        detail: {
          dropping: true,
          source,
        },
      }),
    );
  };

  const handleDragLeave = () => {
    if (!isAcceptable(source)) {
      return;
    }

    node.dispatchEvent(
      new CustomEvent<DroppingEvent<Accepts>>("dropping", {
        detail: {
          dropping: false,
          source,
        },
      }),
    );
  };

  const handleDragOver = (event: DragEvent) => {
    if (event.dataTransfer === null) {
      return;
    }

    if (!isAcceptable(source)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (event: DragEvent) => {
    if (!event.dataTransfer) {
      return;
    }

    if (!isAcceptable(source)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const bounds = node.getBoundingClientRect();

    node.dispatchEvent(
      new CustomEvent<DroppedEvent<Accepts, TargetData>>("dropped", {
        detail: {
          data: {
            dropped: source.data,
            target,
          },
          top: event.clientY - bounds.top - source.top,
          left: event.clientX - bounds.left - source.left,
        },
      }),
    );

    dragging.set(null);
  };

  const unsubscribe = dragging.subscribe((state) => {
    source = state;

    node.dispatchEvent(
      new CustomEvent<AcceptingEvent<Accepts>>("accepting", {
        detail: {
          source: state,
          accepting: state !== null,
        },
      }),
    );
  });

  node.addEventListener("dragenter", handleDragEnter);
  node.addEventListener("dragleave", handleDragLeave);
  node.addEventListener("dragover", handleDragOver);
  node.addEventListener("drop", handleDrop);

  return {
    update(newOptions) {
      accepts = options.accepts;
      target = newOptions.data;
    },
    destroy() {
      node.removeEventListener("dragenter", handleDragEnter);
      node.removeEventListener("dragleave", handleDragLeave);
      node.removeEventListener("dragover", handleDragOver);
      node.removeEventListener("drop", handleDrop);

      unsubscribe();
    },
  };
}

function dropmask(node: HTMLElement) {
  const handleDragOver = (ev: DragEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
  };

  const handleDrop = (ev: DragEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
  };

  node.addEventListener("dragover", handleDragOver);
  node.addEventListener("drop", handleDrop);

  return {
    destroy() {
      node.removeEventListener("dragover", handleDragOver);
      node.removeEventListener("drop", handleDrop);
    },
  };
}

export {
  draggable,
  dropzone,
  dropmask,
  dragging,
  type AcceptsCallback,
  type DragSource,
  type AcceptingEvent,
  type DroppingEvent,
  type DroppedEvent,
  type DragChangeEvent,
};
