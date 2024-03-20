import { type Block as BlockType } from "@/lib/stores/blocks/model/loose";
import { cn } from "@/lib/utils";
import { Bottom } from "@/views/blocks-editor/primitives/connections/Bottom";
import type { Connection } from "@/views/blocks-editor/primitives/connections/types";
import { toBlockColorStyle, type BlockColor } from "@/views/blocks-editor/primitives/types";
import { css } from "@emotion/css";

const styles = {
  container: css`
    border-color: var(--block-bg-primary);
  `,
};

interface CollectionProps {
  owner: BlockType;
  color: BlockColor;
  connection: Connection;
}

function Collection({ owner, color, connection }: CollectionProps) {
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
            <Bottom owner={owner} connection={connection} />
          </div>
        </div>
      </div>
    </div>
  );
}

export { Collection };
