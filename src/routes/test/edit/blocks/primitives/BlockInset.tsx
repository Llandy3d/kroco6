import { isTemplate, type Block as BlockType } from "@/lib/stores/blocks/model/loose";
import { isBlock } from "@/lib/stores/blocks/utils";
import { cn } from "@/lib/utils";
import { useDrop } from "@/routes/test/edit/blocks/primitives/Dnd";
import type { BottomConnection } from "@/routes/test/edit/blocks/primitives/connections/types";
import { toBlockColorStyle, type BlockColor } from "@/routes/test/edit/blocks/primitives/types";
import { css } from "@emotion/css";
import type { ReactNode } from "react";

const styles = {
  root: css`
    opacity: 0.5;
    border-color: var(--block-bg-primary);
  `,
  connected: css`
    border: none;
    opacity: 1;
  `,
  dropping: css`
    opacity: 1;
  `,
};

interface BlockInsetProps<TTarget extends BlockType> {
  owner: BlockType;
  color: BlockColor;
  connection: BottomConnection<TTarget>;
  children: ReactNode;
}

function BlockInset<TTarget extends BlockType>({
  owner,
  color,
  connection,
  children,
}: BlockInsetProps<TTarget>) {
  const { setDropRef, dropping, events } = useDrop({
    data: owner,
    accepts,
    onDrop: (ev) => {
      connection.onDrop(ev.data.dropped);
    },
  });

  function accepts(value: unknown): value is TTarget {
    console.log("accepts", value);

    return !isTemplate(owner) && isBlock(value) && connection.accepts(value);
  }

  return (
    <div className="inline-block flex-auto" style={toBlockColorStyle(color)}>
      <div
        ref={setDropRef}
        className={cn(
          styles.root,
          "block-inset min-h-8 min-w-16 border-2 bg-white",
          dropping && "bg-slate-400",
          dropping && styles.dropping,
          connection.block !== null && styles.connected,
        )}
        {...events}
      >
        {children}
      </div>
    </div>
  );
}

export { BlockInset };
