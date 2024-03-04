interface BlockColor {
  primary: string;
  secondary: string;
}

function toBlockColorStyle(color: BlockColor) {
  return `--block-bg-primary: ${color.primary}; --block-bg-secondary: ${color.secondary};`;
}

export { toBlockColorStyle, type BlockColor };
