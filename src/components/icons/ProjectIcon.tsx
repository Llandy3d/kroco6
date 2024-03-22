interface ProjectIconProps {
  size?: number | string;
}

function ProjectIcon({ size }: ProjectIconProps) {
  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 500"
    >
      <path
        d="M 484.259 431.179 L 19.67 431.179 L 174.335 143.797 L 267.5 203.458 L 389.021 38.417 L 484.259 431.179 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={55}
      />
    </svg>
  );
}

export { ProjectIcon };
