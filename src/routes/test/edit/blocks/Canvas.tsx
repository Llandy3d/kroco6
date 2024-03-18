import {
  detachBlock,
  dropOnCanvas,
  insertNext,
  insertStep,
  updateBlock,
} from "@/lib/stores/blocks";
import { isExecutorBlock, isHttpRequestBlock, isStepBlock } from "@/lib/stores/blocks/utils";
import { cn } from "@/lib/utils";
import { AnyBlock } from "@/routes/test/edit/blocks/AnyBlock";
import { Root } from "@/routes/test/edit/blocks/Root";
import { Toolbox } from "@/routes/test/edit/blocks/Toolbox";
import { useSetTest, useTestValue } from "@/routes/test/edit/blocks/atoms";
import type { DragData, DropData } from "@/routes/test/edit/blocks/dnd/types";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
  type ClientRect,
  type Collision,
  type CollisionDetection,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useState, type MouseEvent } from "react";

import { instantiate, type Block } from "@/lib/stores/blocks/model/loose";
import { detach } from "@/lib/stores/blocks/model/utils";
import { exhaustive } from "@/lib/utils/typescript";
import { DragEnabled } from "@/routes/test/edit/blocks/dnd/DragEnabled";
import { css } from "@emotion/css";

const interactiveElements = ["input", "button", "textarea", "select"];

class NonInteractiveMouseSensor extends MouseSensor {
  static activators = [
    {
      eventName: "onMouseDown" as const,
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

function CanvasRoot() {
  const test = useTestValue();

  const { setNodeRef } = useDroppable({
    id: "canvas",
    data: {
      kind: "canvas",
      action: {
        type: "drop-on-canvas",
      },
    } satisfies DropData,
  });

  function handleClick() {}

  return (
    <div className="relative flex h-full w-full items-stretch overflow-hidden">
      <Toolbox test={test} />
      <div
        ref={setNodeRef}
        className={cn(styles.grid, "relative flex-auto bg-[#F9F8FC]")}
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

function Canvas() {
  const setTest = useSetTest();

  const [dragging, setDragging] = useState<Block | null>(null);

  const sensors = useSensors(
    useSensor(NonInteractiveMouseSensor, {}),
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
        setTest((test) => {
          const activeTop = active.rect.current.translated?.top ?? 0;
          const activeLeft = active.rect.current.translated?.left ?? 0;

          return dropOnCanvas(test, dropped, {
            top: Math.round(activeTop - over.rect.top),
            left: Math.round(activeLeft - over.rect.left),
          });
        });

        break;
      }

      case "attach-step": {
        if (!isStepBlock(dropped)) {
          return;
        }

        setTest((test) => {
          return insertNext(test, action.target, dropped);
        });

        break;
      }

      case "attach-child": {
        if (!isStepBlock(dropped)) {
          return;
        }

        setTest((test) => {
          return insertStep(test, action.target, dropped);
        });

        break;
      }

      case "assign-executor": {
        if (!isExecutorBlock(dropped)) {
          return;
        }

        setTest((test) => {
          return updateBlock(detachBlock(test, dropped), {
            ...detach(action.target, dropped),
            executor: instantiate(dropped),
          });
        });

        break;
      }

      case "assign-check-target": {
        if (!isHttpRequestBlock(dropped)) {
          return;
        }

        setTest((test) => {
          return updateBlock(detachBlock(test, dropped), {
            ...detach(action.target, dropped),
            target: instantiate(dropped),
          });
        });

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
        <CanvasRoot />
      </DragEnabled>
      <DragOverlay dropAnimation={null}>
        <AnyBlock block={dragging} />
      </DragOverlay>
    </DndContext>
  );
}

export { Canvas };
