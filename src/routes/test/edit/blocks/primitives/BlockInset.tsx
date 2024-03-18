import { isTemplate, type Block as BlockType } from "@/lib/stores/blocks/model/loose";
import { isDescendantOf } from "@/lib/stores/blocks/model/utils";
import { cn } from "@/lib/utils";
import type { Connection } from "@/routes/test/edit/blocks/primitives/connections/types";
import { toBlockColorStyle, type BlockColor } from "@/routes/test/edit/blocks/primitives/types";
import { useDroppable } from "@dnd-kit/core";
import { css } from "@emotion/css";

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

interface BlockInsetProps {
  owner: BlockType;
  color: BlockColor;
  connection: Connection;
}

function BlockInset({ owner, color, connection }: BlockInsetProps) {
  const { isOver, active, setNodeRef } = useDroppable({
    id: `${owner.id}-${connection.key}`,
    data: connection.action,
  });

  const block = active?.data.current?.block;

  const accepting =
    block !== undefined &&
    !isTemplate(owner) &&
    !isDescendantOf(block, owner) &&
    connection.accepts(block);

  const dropping = accepting && isOver;

  return (
    <div className="inline-block flex-auto" style={toBlockColorStyle(color)}>
      <div
        ref={setNodeRef}
        className={cn(
          styles.root,
          "block-inset min-h-8 min-w-16 border-2 bg-white",
          connection.connected && styles.connected,
          dropping && "bg-slate-400",
          dropping && styles.dropping,
        )}
      >
        {connection.node}
      </div>
    </div>
  );
}

export { BlockInset };
