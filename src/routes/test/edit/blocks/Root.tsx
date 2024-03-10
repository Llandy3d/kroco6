import type { Root as RootType } from "@/lib/stores/blocks/model/loose";
import { type ReactNode } from "react";

interface RootProps {
  root: RootType;
  children: ReactNode;
}

function Root({ root, children }: RootProps) {
  return (
    <div
      className="absolute"
      style={{ left: `${Math.round(root.left)}px`, top: `${Math.round(root.top)}px` }}
    >
      {children}
    </div>
  );
}

export { Root };
