import {
  isTemplate,
  type Block as BlockType,
} from "@/lib/stores/blocks/model/loose";
import { cn } from "@/lib/utils";
import { useSelectedBlock } from "@/views/editor/tabs/blocks-editor/atoms";
import { useDragging } from "@/views/editor/tabs/blocks-editor/dnd/Draggable";
import { Bottom } from "@/views/editor/tabs/blocks-editor/primitives/connections/Bottom";
import { Top } from "@/views/editor/tabs/blocks-editor/primitives/connections/Top";
import type { Connection } from "@/views/editor/tabs/blocks-editor/primitives/connections/types";
import {
  toBlockColorStyle,
  type BlockColor,
} from "@/views/editor/tabs/blocks-editor/primitives/types";
import { css } from "@emotion/css";
import type { KeyboardEvent, MouseEvent } from "react";

const styles = {
  root: css``,
  body: css`
    border-color: var(--block-bg-primary);
  `,
  dragging: css`
    height: 0;
    overflow: hidden;
    outline: none;

    &.template {
      height: auto;
      opacity: 0.5;
    }

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
  const [selectedBlock, setSelectedBlock] = useSelectedBlock();

  const { isDragging, listeners, attributes, setNodeRef } = useDragging();

  function handleKeyPress(ev: KeyboardEvent<HTMLDivElement>) {
    if (ev.key === "Backspace" && onDelete) {
      ev.preventDefault();
      ev.stopPropagation();

      onDelete(block);
    }
  }

  function handleClick(ev: MouseEvent<HTMLDivElement>) {
    if (isTemplate(block)) {
      return;
    }

    setSelectedBlock(selectedBlock?.id !== block.id ? block : null);

    ev.preventDefault();
    ev.stopPropagation();
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
          !isTemplate(block) && isDragging && "focus:outline-none",
          isTemplate(block) && "template",
        )}
        style={{
          ...toBlockColorStyle(color),
        }}
        onKeyUp={handleKeyPress}
        onClick={handleClick}
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
