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
import type { DragData, DropAction, DropOnCanvasAction } from "@/routes/test/edit/blocks/dnd/types";
import { DndProvider } from "@/routes/test/edit/blocks/primitives/Dnd";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import type { MouseEvent } from "react";

import { instantiate } from "@/lib/stores/blocks/model/loose";
import { exhaustive } from "@/lib/utils/typescript";
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
      type: "drop-on-canvas",
    } satisfies DropOnCanvasAction,
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

function Canvas() {
  const setTest = useSetTest();

  const sensors = useSensors(
    useSensor(NonInteractiveMouseSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (over === null) {
      return;
    }

    if (!over?.data.current || !active.data.current) {
      return;
    }

    const action = over.data.current as DropAction;
    const dropped = active.data.current as DragData;

    switch (action.type) {
      case "drop-on-canvas": {
        setTest((test) => {
          const activeTop = active.rect.current.translated?.top ?? 0;
          const activeLeft = active.rect.current.translated?.left ?? 0;

          return dropOnCanvas(test, dropped.block, {
            top: Math.round(activeTop - over.rect.top),
            left: Math.round(activeLeft - over.rect.left),
          });
        });

        break;
      }

      case "attach-step": {
        const block = dropped.block;

        if (!isStepBlock(block)) {
          return;
        }

        setTest((test) => {
          return insertNext(test, action.target, block);
        });

        break;
      }

      case "attach-child": {
        const block = dropped.block;

        if (!isStepBlock(block)) {
          return;
        }

        setTest((test) => {
          return insertStep(test, action.target, block);
        });

        break;
      }

      case "assign-executor": {
        const block = dropped.block;

        if (!isExecutorBlock(block)) {
          return;
        }

        setTest((test) => {
          return updateBlock(detachBlock(test, block), {
            ...action.target,
            executor: instantiate(block),
          });
        });

        break;
      }

      case "assign-check-target": {
        const block = dropped.block;

        if (!isHttpRequestBlock(block)) {
          return;
        }

        setTest((test) => {
          return updateBlock(detachBlock(test, block), {
            ...action.target,
            target: instantiate(block),
          });
        });

        break;
      }

      default:
        return exhaustive(action);
    }
  }

  return (
    <DndProvider>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <CanvasRoot />
      </DndContext>
    </DndProvider>
  );
}

export { Canvas };
