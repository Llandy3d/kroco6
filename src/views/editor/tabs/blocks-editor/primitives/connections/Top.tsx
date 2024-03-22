import { cn } from "@/lib/utils";
import { css } from "@emotion/css";

const styles = {
  top: css`
    display: flex;
    color: var(--block-bg-primary);

    .block-inset & {
      border-top: 1px solid var(--block-bg-primary);
    }
  `,
  left: css`
    border-top: 1px solid var(--block-bg-primary);
    width: 32px;

    .block-inset & {
      display: none;
    }
  `,
  notch: css`
    .block-inset & {
      display: none;
    }
  `,
  right: css`
    flex: 1 1 auto;
    border-top: 1px solid var(--block-bg-primary);

    .block-inset & {
      display: none;
    }
  `,
};

function Top() {
  return (
    <div className={styles.top}>
      <div className={styles.left}></div>
      <div className={cn(styles.notch, "relative w-4")}>
        <svg className="absolute block w-4" viewBox="0 0 100 50">
          <line x1="0" y1="0" x2="50" y2="40" strokeWidth="6" stroke="currentColor" />
          <line x1="50" y1="40" x2="100" y2="0" strokeWidth="6" stroke="currentColor" />
        </svg>
      </div>
      <div className={styles.right}></div>
    </div>
  );
}

export { Top };
