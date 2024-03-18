import { isTemplate, type Block as BlockType } from "@/lib/stores/blocks/model/loose";
import { cn } from "@/lib/utils";
import { Bottom } from "@/routes/test/edit/blocks/primitives/connections/Bottom";
import { Top } from "@/routes/test/edit/blocks/primitives/connections/Top";
import type { Connection } from "@/routes/test/edit/blocks/primitives/connections/types";
import { toBlockColorStyle, type BlockColor } from "@/routes/test/edit/blocks/primitives/types";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { css } from "@emotion/css";
import type { KeyboardEvent } from "react";

const styles = {
  root: css``,
  body: css`
    border-color: var(--block-bg-primary);
  `,
  dragging: css`
    z-index: 1000;

    * {
      pointer-events: none;
    }
  `,
  hasTop: css`
    border-top: none;
  `,
};

interface BlockProps<TBlock extends BlockType> {
  block: TBlock;
  color: BlockColor;
  top?: ((value: unknown) => boolean) | boolean;
  bottom?: Connection;
  children: React.ReactNode;
  onDelete: (block: TBlock) => void;
}

function Block<TBlock extends BlockType>({
  block,
  color,
  top,
  bottom,
  children,
  onDelete,
}: BlockProps<TBlock>) {
  const { isDragging, listeners, attributes, transform, setNodeRef } = useDraggable({
    id: block.id,
    data: {
      block,
    },
  });

  function handleKeyPress(ev: KeyboardEvent<HTMLDivElement>) {
    if (ev.key === "Backspace" && onDelete) {
      ev.preventDefault();
      ev.stopPropagation();

      onDelete(block);
    }
  }

  return (
    <>
      <div
        ref={setNodeRef}
        id={block.id}
        className={cn(
          styles.root,
          "relative z-10 flex w-min flex-col outline-2 outline-indigo-500 focus:outline",
          isDragging && styles.dragging,
          isTemplate(block) && "template",
        )}
        style={{
          ...toBlockColorStyle(color),
          transform: CSS.Translate.toString(transform),
        }}
        onKeyUp={handleKeyPress}
        {...listeners}
        {...attributes}
      >
        <div
          className={cn(
            styles.body,
            "w-min cursor-grab rounded-l-sm border-[1px] border-l-8 bg-white shadow-sm shadow-slate-300",
            top && styles.hasTop,
          )}
        >
          {top && <Top />}
          <div className="px-2 py-1">{children}</div>
        </div>
        {bottom && <Bottom owner={block} connection={bottom} />}
      </div>
    </>
  );
}

export { Block };
