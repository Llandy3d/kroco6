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
    console.log("i was changed");
    const item = tabs.find((tab) => tab.value === value);

    if (item === undefined) {
      return;
    }

    onChange(item);
  }

  return (
    <div className="flex">
      <Tabs className="flex" value={current?.value ?? ""} onValueChange={handleValueChange}>
        {align === "right" && <TabsBody expanded={expandedState.expanded}>{children}</TabsBody>}
        <TabsList className="border-r-[1px]">
          {tabs.map((tab) => {
            return (
              <TabsTrigger
                key={tab.value}
                className="flex flex-col items-center gap-2 p-4 hover:bg-slate-100 data-[state=active]:text-primary"
                value={tab.value}
                onClick={current?.value === tab.value ? handleToggle : undefined}
              >
                <span className="text-slate-400">{tab.icon}</span>
                <span className="uppercase [writing-mode:vertical-lr]">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        {align === "left" && <TabsBody expanded={expandedState.expanded}>{children}</TabsBody>}
      </Tabs>
    </div>
  );
}

interface VerticalTabsContentProps {
  value: string;
  children: ReactNode;
}

function VerticalTabsContent({ value, children }: VerticalTabsContentProps) {
  return (
    <TabsContent value={value} className="min-w-80 border-r-[1px] p-2">
      {children}
    </TabsContent>
  );
}

export { VerticalTabs, VerticalTabsContent, type Tab };
