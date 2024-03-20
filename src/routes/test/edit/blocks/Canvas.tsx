import {
  detachBlock,
  dropOnCanvas,
  insertChild,
  insertNext,
  updateBlock,
} from "@/lib/stores/blocks";
import { isExecutorBlock, isHttpRequestBlock, isStepBlock } from "@/lib/stores/blocks/utils";
import { cn } from "@/lib/utils";
import { AnyBlock } from "@/routes/test/edit/blocks/AnyBlock";
import { Root } from "@/routes/test/edit/blocks/Root";
import { Toolbox } from "@/routes/test/edit/blocks/Toolbox";
import type { DragData, DropData } from "@/routes/test/edit/blocks/dnd/types";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
  type ClientRect,
  type Collision,
  type CollisionDetection,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useState, type MouseEvent, type ReactNode } from "react";

import { instantiate, type Block, type Test } from "@/lib/stores/blocks/model/loose";
import { detach } from "@/lib/stores/blocks/model/utils";
import { exhaustive } from "@/lib/utils/typescript";
import { BlockSidebar } from "@/routes/test/edit/blocks/BlockSidebar";
import { useSetSelectedBlock } from "@/routes/test/edit/blocks/atoms";
import { DragEnabled } from "@/routes/test/edit/blocks/dnd/DragEnabled";
import { css } from "@emotion/css";

const interactiveElements = ["input", "button", "textarea", "select"];

class NonInteractiveMouseSensor extends PointerSensor {
  static activators = [
    {
      eventName: "onPointerDown" as const,
      handler({ nativeEvent: event }: MouseEvent) {
        if (event.target instanceof HTMLElement) {
          return (
            event.button === 0 && !interactiveElements.includes(event.target.tagName.toLowerCase())
          );
        }

        return true;
      },
    },
  ];
}

const styles = {
  grid: css`
    &::before {
      content: " ";
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;

      background-repeat: repeat;
      opacity: 0.1;
      background-size: 80px;
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADCSURBVHgB7dyxCYBAEATAwwq1/wbki1BfMRDDR14PZ+DARDYRs90IAAAAAAAAgLupXqk31xujP/nv5h/B63kl+pP/QP4Q7a7vLtGf/Hfzj1/Q/hWW81n+v/IBAAAAAAAAAAAAAAAAgGT08+0D6Odnz7cPIL+Zfr59AAAAAAAAAAAAAAAAAAAgEf18+wD6+dnz7QPIb6afbx8AAAAAAAAAAAAAAAAAAEhEP98+gH5+9nz7APKb6efbBwAAAAAAAAA+awMQDJt5iCyvlQAAAABJRU5ErkJggg==);
    }
  `,
};

interface SidebarProps {
  align: "left" | "right";
  children: ReactNode;
}

function Sidebar({ align, children }: SidebarProps) {
  return (
    <div className={cn("absolute bottom-0 top-0 z-10 bg-white", align === "right" && "right-0")}>
      {children}
    </div>
  );
}

interface CanvasRootProps {
  test: Test;
}

function CanvasRoot({ test }: CanvasRootProps) {
  const setSelectedBlock = useSetSelectedBlock();

  const { setNodeRef } = useDroppable({
    id: "canvas",
    data: {
      kind: "canvas",
      action: {
        type: "drop-on-canvas",
      },
    } satisfies DropData,
  });

  function handleClick() {
    setSelectedBlock(null);
  }

  return (
    <div className="relative h-full w-full">
      <Sidebar align="left">
        <Toolbox test={test} />
      </Sidebar>
      <div
        ref={setNodeRef}
        className={cn(styles.grid, "relative z-0 h-full w-full bg-[#F9F8FC]")}
        onClick={handleClick}
      >
        {test.roots.map((root) => {
          return (
            <Root key={root.block.id} root={root}>
              <AnyBlock block={root.block} />
            </Root>
          );
        })}
      </div>
      <Sidebar align="right">
        <BlockSidebar />
      </Sidebar>
    </div>
  );
}

function isInRange(value: number, min: number, max: number) {
  return value >= min && value <= max;
}

function isOverlappingHorizontally(left: ClientRect, right: ClientRect, toleranceX: number) {
  return isInRange(left.left, right.left - toleranceX, right.right);
}

const collisionDetection: CollisionDetection = (args) => {
  const collisions: Array<Collision & { difference: number }> = [];
  const collisionRect = args.collisionRect;

  const toleranceX = (args.pointerCoordinates?.x ?? 0) - collisionRect.left;
  const toleranceY = (args.pointerCoordinates?.y ?? 0) - collisionRect.top;

  for (const container of args.droppableContainers) {
    const rect = args.droppableRects.get(container.id);

    if (rect === undefined || collisionRect.top < rect.top - toleranceY) {
      continue;
    }

    if (!isOverlappingHorizontally(collisionRect, rect, toleranceX)) {
      continue;
    }

    const distance = collisionRect.top - rect.top;

    if (distance > 16) {
      continue;
    }

    collisions.push({
      id: container.id,
      data: container.data,
      difference: distance,
    });
  }

  const sorted: Collision[] = collisions.sort((a, b) => a.difference - b.difference);

  const canvas = pointerWithin({
    ...args,
    droppableContainers: args.droppableContainers.filter(
      (container) => container.data.current?.kind === "canvas",
    ),
  });

  sorted.push(...canvas);

  return collisions;
};

interface CanvasProps {
  test: Test;
  onChange: (test: Test) => void;
}

function Canvas({ test, onChange }: CanvasProps) {
  const [dragging, setDragging] = useState<Block | null>(null);

  const sensors = useSensors(
    useSensor(NonInteractiveMouseSensor, { activationConstraint: { distance: 1 } }),
    useSensor(KeyboardSensor, {}),
  );

  function handleDragStart({ active }: DragEndEvent) {
    if (active.data.current) {
      setDragging(active.data.current.block);
    }
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setDragging(null);

    if (over === null) {
      return;
    }

    if (!over?.data.current || !active.data.current) {
      return;
    }

    const { action } = over.data.current as DropData;
    const { block: dropped } = active.data.current as DragData;

    switch (action.type) {
      case "drop-on-canvas": {
        const activeTop = active.rect.current.translated?.top ?? 0;
        const activeLeft = active.rect.current.translated?.left ?? 0;

        onChange(
          dropOnCanvas(test, dropped, {
            top: Math.round(activeTop - over.rect.top),
            left: Math.round(activeLeft - over.rect.left),
          }),
        );

        break;
      }

      case "attach-step": {
        if (!isStepBlock(dropped)) {
          return;
        }

        onChange(insertNext(test, action.target, dropped));

        break;
      }

      case "attach-child": {
        if (!isStepBlock(dropped)) {
          return;
        }

        onChange(insertChild(test, action.target, dropped));

        break;
      }

      case "assign-executor": {
        if (!isExecutorBlock(dropped)) {
          return;
        }

        onChange(
          updateBlock(detachBlock(test, dropped), {
            ...detach(action.target, dropped),
            executor: instantiate(dropped),
          }),
        );

        break;
      }

      case "assign-check-target": {
        if (!isHttpRequestBlock(dropped)) {
          return;
        }

        onChange(
          updateBlock(detachBlock(test, dropped), {
            ...detach(action.target, dropped),
            target: instantiate(dropped),
          }),
        );

        break;
      }

      default:
        return exhaustive(action);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <DragEnabled>
        <CanvasRoot test={test} />
      </DragEnabled>
      <DragOverlay dropAnimation={null}>
        <AnyBlock block={dragging} />
      </DragOverlay>
    </DndContext>
  );
}

export { Canvas };
