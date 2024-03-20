import { TabsTrigger } from "@/components/ui/tabs";
import type { ReactNode } from "react";

interface TabButtonProps {
  value: string;
  children: ReactNode;
}

function TabButton({ value, children }: TabButtonProps) {
  return (
    <TabsTrigger
      className="flex w-32 items-center justify-center gap-2 border-r-[1px] px-6 py-2 font-extralight data-[state=active]:font-normal data-[state=active]:text-primary"
      value={value}
    >
      {children}
    </TabsTrigger>
  );
}

export { TabButton };
