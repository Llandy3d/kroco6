import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import type { ReactNode } from "react";

interface EditorTabsProps {
  value: string;
  children: ReactNode;
  onValueChange: (value: string) => void;
}

function EditorTabs({ value, children, onValueChange }: EditorTabsProps) {
  return (
    <Tabs className="flex flex-auto flex-col" value={value} onValueChange={onValueChange}>
      {children}
    </Tabs>
  );
}

interface EditorTabsListProps {
  className?: string;
  children: ReactNode;
}

function EditorTabsList({ className, children }: EditorTabsListProps) {
  return (
    <TabsList
      className={cn("bg-default flex rounded-none border-b-[1px] p-4 shadow-none", className)}
    >
      {children}
    </TabsList>
  );
}

interface EditorTabsTriggerProps {
  value: string;
  children: ReactNode;
}

function EditorTabsTrigger({ value, children }: EditorTabsTriggerProps) {
  return (
    <TabsTrigger
      className="flex w-32 items-center justify-center gap-2 border-r-[1px] px-6 py-2 font-extralight data-[state=active]:font-normal data-[state=active]:text-primary"
      value={value}
    >
      {children}
    </TabsTrigger>
  );
}

export { EditorTabs, EditorTabsList, EditorTabsTrigger };
