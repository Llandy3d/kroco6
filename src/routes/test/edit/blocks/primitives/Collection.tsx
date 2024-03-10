import { isTemplate, type Block, type Block as BlockType } from "@/lib/stores/blocks/model/loose";
import { isBlock } from "@/lib/stores/blocks/utils";
import { cn } from "@/lib/utils";
import type { DropEvent } from "@/routes/test/edit/blocks/primitives/Dnd";
import { Bottom } from "@/routes/test/edit/blocks/primitives/connections/Bottom";
import type { BottomConnection } from "@/routes/test/edit/blocks/primitives/connections/types";
import { toBlockColorStyle, type BlockColor } from "@/routes/test/edit/blocks/primitives/types";
import { css } from "@emotion/css";
import type { ReactNode } from "react";

const styles = {
  container: css`
    border-color: var(--block-bg-primary);
  `,
};

interface CollectionProps<TBottom extends BlockType> {
  owner: BlockType;
  color: BlockColor;
  connection: BottomConnection<TBottom>;
  children: ReactNode;
}

function Collection<TBottom extends BlockType>({
  owner,
  color,
  connection,
  children,
}: CollectionProps<TBottom>) {
  function handleDropped(ev: DropEvent<Block | null, TBottom>) {
    connection.onDrop(ev.data.dropped);
  }

  function acceptsBlock(value: unknown): value is TBottom {
    return !isTemplate(owner) && isBlock(value) && connection.accepts(value);
  }

  return (
    <div className="collection-root">
      <div className="select-none">
        <div className="flex rounded-l-md py-2">
          <div
            className={cn(
              styles.container,
              "collection-container relative mb-4 flex w-6 flex-auto list-none flex-col border-t-4",
            )}
            style={toBlockColorStyle(color)}
          >
            <Bottom accepts={acceptsBlock} data={owner} collection={true} onDrop={handleDropped} />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export { Collection };
