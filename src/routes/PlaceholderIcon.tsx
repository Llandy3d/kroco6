interface PlaceholderIconProps {
  size?: number;
}

function PlaceholderIcon({ size = 24 }: PlaceholderIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    ></svg>
  );
}

export { PlaceholderIcon };
