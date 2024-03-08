import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ListButtonProps {
  selected: boolean;
  children: ReactNode;
  onClick: () => void;
}

function ListButton({ selected, children, onClick }: ListButtonProps) {
  return (
    <li className="border-b-[1px] first-of-type:border-t-[1px]">
      <button
        className={cn(
          "h-16 w-full justify-start rounded-none  px-2  hover:bg-secondary",
          selected && "bg-gray-200",
        )}
        onClick={onClick}
      >
        {children}
      </button>
    </li>
  );
}

export { ListButton };
