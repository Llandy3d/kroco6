import { isTemplate, type Block as BlockType } from "@/lib/stores/blocks/model/loose";
import { isBlock } from "@/lib/stores/blocks/utils";
import { cn } from "@/lib/utils";
import { useDrag, type DropEvent } from "@/routes/test/edit/blocks/primitives/Dnd";
import { Bottom } from "@/routes/test/edit/blocks/primitives/connections/Bottom";
import { Top } from "@/routes/test/edit/blocks/primitives/connections/Top";
import type { BottomConnection } from "@/routes/test/edit/blocks/primitives/connections/types";
import { toBlockColorStyle, type BlockColor } from "@/routes/test/edit/blocks/primitives/types";
import { css } from "@emotion/css";
import type { ComponentType, KeyboardEvent } from "react";

const styles = {
  root: css``,
  body: css`
    border-color: var(--block-bg-primary);
  `,
  dragging: css`
    opacity: 0.8;

    * {
      pointer-events: none;
    }
  `,
  hasTop: css`
    border-top: none;
  `,
};

interface BlockProps<TBlock extends BlockType, TBottom extends BlockType> {
  block: TBlock;
  color: BlockColor;
  top?: ((value: unknown) => boolean) | boolean;
  bottom?: BottomConnection<TBottom> | null;
  children: React.ReactNode;
  Next?: ComponentType<{ block: BlockType }>;
  onDelete: (block: TBlock) => void;
}

function Block<TBlock extends BlockType, TBottom extends BlockType>({
  block,
  color,
  top,
  bottom,
  children,
  Next,
  onDelete,
}: BlockProps<TBlock, TBottom>) {
  const { setDraggableRef, dragging, events } = useDrag({
    data: block,
    accepts: acceptsTop,
  });

  function handleKeyPress(ev: KeyboardEvent<HTMLDivElement>) {
    if (ev.key === "Backspace" && onDelete) {
      ev.preventDefault();
      ev.stopPropagation();

      onDelete(block);
    }
  }

  function acceptsTop(value: unknown) {
    if (value === "canvas") {
      return true;
    }

    if (!isBlock(value) || value.id === block.id) {
      return false;
    }

    if (top === undefined) {
      return false;
    }

    if (typeof top === "boolean") {
      return top;
    }

    return top(value);
  }

  function acceptsBottom(value: unknown): value is TBottom {
    if (!bottom) {
      return false;
    }

    return !isTemplate(block) && isBlock(value) && bottom.accepts(value);
  }

  function handleDropBottom(ev: DropEvent<BlockType, TBottom>) {
    bottom?.onDrop(ev.data.dropped);
  }

  return (
    <>
      <div
        ref={setDraggableRef}
        id={block.id}
        tabIndex={0}
        className={cn(
          styles.root,
          "z-10 flex w-min flex-col outline-2 outline-indigo-500 focus:outline",
          dragging && styles.dragging,
        )}
        style={toBlockColorStyle(color)}
        onKeyUp={handleKeyPress}
        {...events}
      >
        <div
          className={cn(
            styles.body,
            "w-min cursor-grab rounded-l-sm border-[1px] border-l-8 bg-white shadow-sm shadow-slate-300",
            top && styles.hasTop,
          )}
        >
          <div className="relative flex flex-col">
            {top && <Top />}
            <div className="px-2 py-1">{children}</div>
          </div>
          {bottom && <Bottom data={block} accepts={acceptsBottom} onDrop={handleDropBottom} />}
        </div>
        <div>{Next && bottom?.block && <Next block={bottom.block} />}</div>
      </div>
    </>
  );
}

export { Block };
