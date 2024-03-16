import { dropOnCanvas, insertNext, insertStep } from "@/lib/stores/blocks";
import { isStepBlock } from "@/lib/stores/blocks/utils";
import { cn } from "@/lib/utils";
import { AnyBlock } from "@/routes/test/edit/blocks/AnyBlock";
import { Root } from "@/routes/test/edit/blocks/Root";
import { Toolbox } from "@/routes/test/edit/blocks/Toolbox";
import { useSetTest, useTestValue } from "@/routes/test/edit/blocks/atoms";
import type { DragData, DropAction, DropOnCanvasAction } from "@/routes/test/edit/blocks/dnd/types";
import { DndProvider } from "@/routes/test/edit/blocks/primitives/Dnd";
import { DndContext, useDroppable, type DragEndEvent } from "@dnd-kit/core";

import { css } from "@emotion/css";

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
            top: activeTop - over.rect.top,
            left: activeLeft - over.rect.left,
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
    }
  }

  return (
    <DndProvider>
      <DndContext onDragEnd={handleDragEnd}>
        <CanvasRoot />
      </DndContext>
    </DndProvider>
  );
}

export { Canvas };
