import { isTemplate, type Block } from "@/lib/stores/blocks/model/loose";
import { isDescendantOf } from "@/lib/stores/blocks/model/utils";
import { cn } from "@/lib/utils";
import type { DropData } from "@/views/editor/tabs/blocks-editor/dnd/types";
import type { Connection } from "@/views/editor/tabs/blocks-editor/primitives/connections/types";
import { useDroppable } from "@dnd-kit/core";
import { css } from "@emotion/css";

const styles = {
  root: css`
    background-color: var(--block-bg-primary);

    .block-inset & {
      display: none;
    }

    svg {
      position: absolute;
      left: 40px;
      fill: var(--block-bg-primary);
    }
  `,
  dropping: css`
    position: relative;
    background-color: #000;
    opacity: 0.2;
  `,
};

interface BottomProps {
  owner: Block;
  connection: Connection;
}

function Bottom({ owner, connection }: BottomProps) {
  const { active, isOver, setNodeRef } = useDroppable({
    id: `${owner.id}-${connection.key}`,
    data: {
      kind: "bottom",
      action: connection.action,
    } satisfies DropData,
  });

  const block = active?.data.current?.block as Block;

  const accepting =
    block !== undefined &&
    !isTemplate(owner) &&
    !isDescendantOf(block, owner) &&
    connection.accepts(block);

  const dropping = accepting && isOver;

  return (
    <>
      <div className={cn(styles.root, "relative z-20")}>
        <svg
          width="16px"
          height="8px"
          viewBox="0 0 100 50"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon points="0,0 100,0 50,40" />
        </svg>
      </div>
      <div className="relative">
        <div
          ref={setNodeRef}
          className={cn("absolute w-full", dropping && styles.dropping)}
          style={{
            display: accepting ? "block" : "none",
            height: accepting ? active?.rect.current.initial?.height : 0,
            width: accepting ? active?.rect.current.initial?.width : 0,
          }}
        ></div>
      </div>
      {connection.node}
    </>
  );
}

export { Bottom };
