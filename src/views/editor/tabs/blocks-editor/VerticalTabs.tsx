import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { useState, type ReactNode } from "react";

interface Tab {
  value: string;
  icon: ReactNode;
  label: ReactNode;
}

interface TabsBodyProps {
  expanded: boolean;
  children: ReactNode;
}

function TabsBody({ expanded, children }: TabsBodyProps) {
  if (!expanded) {
    return null;
  }

  return <>{children}</>;
}

interface VerticalTabsProps {
  current: Tab;
  tabs: Tab[];
  align: "left" | "right";
  expandedByDefault?: boolean;
  children: ReactNode;
  onChange: (tab: Tab) => void;
}

function VerticalTabs({
  current,
  tabs,
  align,
  expandedByDefault = true,
  children,
  onChange,
}: VerticalTabsProps) {
  const [expandedState, setExpandedState] = useState({
    expanded: expandedByDefault,
    value: current.value,
  });

  function handleToggle() {
    if (current.value !== expandedState.value) {
      setExpandedState({
        expanded: true,
        value: current.value,
      });

      return;
    }

    setExpandedState({
      ...expandedState,
      expanded: !expandedState.expanded,
    });
  }

  function handleValueChange(value: string) {
    const item = tabs.find((tab) => tab.value === value);

    if (item === undefined) {
      return;
    }

    onChange(item);
  }

  return (
    <Tabs
      className={cn(
        "flex h-full",
        align === "left" ? "flex-row" : "flex-row-reverse",
      )}
      value={current?.value ?? ""}
      orientation="vertical"
      onValueChange={handleValueChange}
    >
      <TabsList className="flex flex-col border-r-[1px]">
        {tabs.map((tab) => {
          return (
            <TabsTrigger
              key={tab.value}
              className="flex w-max flex-col items-center gap-2 whitespace-nowrap p-4 hover:bg-slate-100 data-[state=active]:text-primary"
              value={tab.value}
              onClick={current?.value === tab.value ? handleToggle : undefined}
            >
              <span className="text-slate-400">{tab.icon}</span>
              <span className="uppercase [writing-mode:vertical-lr]">
                {tab.label}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
      <TabsBody expanded={expandedState.expanded}>{children}</TabsBody>
    </Tabs>
  );
}

interface VerticalTabsContentProps {
  className?: string;
  value: string;
  children: ReactNode;
}

function VerticalTabsContent({
  className,
  value,
  children,
}: VerticalTabsContentProps) {
  return (
    <TabsContent
      value={value}
      className={cn("min-w-80 border-r-[1px] p-2", className)}
    >
      {children}
    </TabsContent>
  );
}

export { VerticalTabs, VerticalTabsContent, type Tab };
