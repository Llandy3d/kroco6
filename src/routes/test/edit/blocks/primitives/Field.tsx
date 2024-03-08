import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface FieldProps {
  className?: string;
  children: ReactNode;
}

function Field({ className, children }: FieldProps) {
  return (
    <div
      className={cn(
        "relative flex items-center gap-2 whitespace-nowrap border-slate-400  p-1 text-xs text-black",
        className,
      )}
    >
      {children}
    </div>
  );
}

export { Field };
