interface ProjectIconProps {
  size?: number | string;
}

function ProjectIcon({ size }: ProjectIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 374 362"
      fill="none"
      style={{ position: "relative", top: -1 }}
    >
      <path
        d="M373.5 361.998H0.5L124.674 97.1265L199.473 152.115L297.037 0.00146484L373.5 361.998ZM236.74 304.788H237.538C246.77 304.805 255.647 301.236 262.298 294.836C265.707 291.743 268.418 287.961 270.253 283.74C272.088 279.519 273.005 274.957 272.942 270.355C273.094 265.921 272.252 261.51 270.477 257.444C268.702 253.378 266.039 249.761 262.684 246.859C257.028 241.184 249.406 237.902 241.397 237.692H240.785C239.736 237.687 238.693 237.83 237.685 238.117L257.376 208.847L241.689 197.897L234.265 208.847L215.293 237.825C212.033 242.628 209.305 246.859 207.616 249.799C205.863 252.91 204.355 256.153 203.105 259.498C201.684 263.053 200.953 266.846 200.95 270.674C200.906 275.222 201.819 279.728 203.63 283.9C205.44 288.072 208.109 291.816 211.461 294.889C218.025 301.284 226.831 304.856 235.995 304.841L236.74 304.788ZM153.346 273.282L175.086 304.029H198.329L172.757 268.359L195.469 236.827L180.394 226.396L173.742 235.177L153.319 263.969V206.079L132.963 189.488V304.016H153.319V273.255L153.346 273.282ZM236.767 285.589C232.797 285.589 228.99 284.012 226.183 281.205C223.376 278.398 221.799 274.591 221.799 270.621C221.799 266.651 223.376 262.844 226.183 260.037C228.99 257.23 232.797 255.653 236.767 255.653H236.9C238.871 255.655 240.822 256.056 242.635 256.831C244.448 257.606 246.086 258.74 247.45 260.164C248.886 261.482 250.029 263.087 250.806 264.874C251.582 266.662 251.976 268.592 251.961 270.541C251.912 274.538 250.292 278.354 247.451 281.165C244.61 283.976 240.776 285.556 236.78 285.562L236.767 285.589Z"
        fill="#000"
      />
    </svg>
  );
}

export { ProjectIcon };