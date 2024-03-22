import type { CSSProperties } from "react";

interface BlockColor {
  primary: string;
  secondary: string;
}

function toBlockColorStyle(color: BlockColor): CSSProperties {
  return {
    "--block-bg-primary": color.primary,
    "--block-bg-secondary": color.secondary,
  };
}

export { toBlockColorStyle, type BlockColor };
