import { isTemplate, type Block } from "@/lib/stores/blocks/model/loose";
import { cn } from "@/lib/utils";
import { exhaustive } from "@/lib/utils/typescript";
import type { Connection } from "@/routes/test/edit/blocks/primitives/connections/types";
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
      left: 32px;
      left: 40px;
      /* top: 1px; */
      fill: var(--block-bg-primary);
    }
  `,
  dropping: css`
    /* position: relative; */
    background-color: #000;
    opacity: 0.2;
  `,
};

function isDescendantOf(current: Block | null, target: Block): boolean {
  if (current === null) {
    return false;
  }

  if (current.id === target.id) {
    return true;
  }

  switch (current.type) {
    case "scenario":
      return isDescendantOf(current.executor, target) || isDescendantOf(current.step, target);

    case "group":
      return isDescendantOf(current.step, target) || isDescendantOf(current.next, target);

    case "check":
      return isDescendantOf(current.next, target) || isDescendantOf(current.target, target);

    case "sleep":
    case "http-request":
    case "library":
      return isDescendantOf(current.next, target);

    case "executor":
      return current.id === target.id;

    default:
      return exhaustive(current);
  }
}

interface BottomProps {
  owner: Block;
  connection: Connection;
}

function Bottom({ owner, connection }: BottomProps) {
  const { active, isOver, setNodeRef } = useDroppable({
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
    <div style={{ paddingBottom: dropping ? active?.rect.current.initial?.height : 0 }}>
      <div className={cn(styles.root, "relative z-20")}>
        <svg width="16px" height="8px" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,0 100,0 50,40" />
        </svg>
      </div>
      <div className="relative">
        <div
          ref={setNodeRef}
          className={cn("absolute w-full", dropping && styles.dropping)}
          style={{
            height: accepting ? active?.rect.current.initial?.height : 0,
          }}
        ></div>
      </div>
      {connection.node}
    </div>
  );
}

export { Bottom };
