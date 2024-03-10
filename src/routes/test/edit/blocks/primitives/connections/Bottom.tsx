import { cn } from "@/lib/utils";
import { useDrop, type DropEvent } from "@/routes/test/edit/blocks/primitives/Dnd";
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
      top: 1px;
      fill: var(--block-bg-primary);
    }
  `,
  dropping: css`
    position: relative;
    background-color: #000;
    max-height: none;
    opacity: 0.2;
  `,
  collection: css`
    svg {
      top: 0;
      left: 40px;
    }
  `,
};

interface BottomProps<Target, Dropped> {
  data: Target;
  collection?: boolean;
  accepts: (value: unknown) => value is Dropped;
  onDrop: (ev: DropEvent<Target, Dropped>) => void;
}

function Bottom<Target, Dropped>({
  data,
  collection = false,
  accepts,
  onDrop,
}: BottomProps<Target, Dropped>) {
  const { setDropRef, accepting, dragging, dropping, events } = useDrop({
    data,
    accepts,
    onDrop,
  });

  return (
    <>
      <div className={cn(styles.root, "relative z-20", collection && styles.collection)}>
        <svg width="16px" height="8px" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,0 100,0 50,40" />
        </svg>
      </div>
      <div className="relative">
        <div
          ref={setDropRef}
          className={cn("absolute max-h-4 w-full", dropping && styles.dropping)}
          style={{
            height: accepting && dragging ? dragging.bounds.height : 0,
          }}
          {...events}
        ></div>
      </div>
    </>
  );
}

export { Bottom };
