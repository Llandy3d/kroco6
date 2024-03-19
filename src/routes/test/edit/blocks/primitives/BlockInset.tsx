import { isTemplate, type Block as BlockType } from "@/lib/stores/blocks/model/loose";
import { isDescendantOf } from "@/lib/stores/blocks/model/utils";
import { cn } from "@/lib/utils";
import type { DropData } from "@/routes/test/edit/blocks/dnd/types";
import type { Connection } from "@/routes/test/edit/blocks/primitives/connections/types";
import { toBlockColorStyle, type BlockColor } from "@/routes/test/edit/blocks/primitives/types";
import { useDroppable } from "@dnd-kit/core";
import { css } from "@emotion/css";

const styles = {
  root: css`
    opacity: 0.5;
    border: 2px solid var(--block-bg-primary);
  `,
  connected: css`
    border: none;
    opacity: 1;
  `,
  dragging: css`
    border: 2px solid var(--block-bg-primary);
  `,
  dropping: css`
    opacity: 1;
  `,
};

interface BlockInsetProps {
  owner: BlockType;
  color: BlockColor;
  connection: Connection;
}

function BlockInset({ owner, color, connection }: BlockInsetProps) {
  const { isOver, active, setNodeRef } = useDroppable({
    id: `${owner.id}-${connection.key}`,
    data: {
      kind: "inset",
      action: connection.action,
    } satisfies DropData,
  });

  const block = active?.data.current?.block;

  const accepting =
    block !== undefined &&
    !isTemplate(owner) &&
    !isDescendantOf(block, owner) &&
    connection.accepts(block);

  const dropping = accepting && isOver;
  const dragging = active?.id === connection.connected?.id;

  return (
    <div className="inline-block flex-auto" style={toBlockColorStyle(color)}>
      <div
        className={cn(
          styles.root,
          "block-inset relative min-h-8 min-w-16 bg-white",
          connection.connected && styles.connected,
          dragging && styles.dragging,
          dropping && "bg-slate-400",
          dropping && styles.dropping,
        )}
      >
        <div
          ref={setNodeRef}
          className={cn("absolute bottom-0 left-0 right-0 top-0 hidden", accepting && "block")}
        ></div>
        {connection.node}
      </div>
    </div>
  );
}

export { BlockInset };
