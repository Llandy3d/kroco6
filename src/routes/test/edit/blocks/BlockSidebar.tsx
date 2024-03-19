import type { Block, HttpRequestBlock } from "@/lib/stores/blocks/model/loose";
import {
  VerticalTabs,
  VerticalTabsContent,
  type Tab,
} from "@/routes/test/edit/blocks/VerticalTabs";
import { useSelectedBlockValue } from "@/routes/test/edit/blocks/atoms";
import { Handshake, PackageOpen, Variable } from "lucide-react";
import { useState } from "react";

function hasRequestBody(method: string) {
  return ["post", "put", "delete", "patch"].includes(method.toLowerCase());
}

const STATIC_TABS: [tab: Tab, ...rest: Tab[]] = [
  {
    value: "parameters",
    label: "Parameters",
    icon: <Variable size={24} />,
  },
  {
    value: "headers",
    label: "Headers",
    icon: <Handshake size={24} />,
  },
];

interface HttpRequestSidebarProps {
  block: HttpRequestBlock;
}

function HttpRequestSidebar({ block }: HttpRequestSidebarProps) {
  const [current, setCurrent] = useState<Tab>(STATIC_TABS[0]);

  const tabs = [
    ...STATIC_TABS,
    ...(hasRequestBody(block.method)
      ? [
          {
            value: "body",
            label: "Body",
            icon: <PackageOpen size={24} />,
          },
        ]
      : []),
  ];

  return (
    <VerticalTabs
      current={current}
      align="right"
      expandedByDefault={false}
      tabs={tabs}
      onChange={setCurrent}
    >
      <VerticalTabsContent value="parameters">Hello parameters!</VerticalTabsContent>
      <VerticalTabsContent value="headers">Hello headers!</VerticalTabsContent>
      <VerticalTabsContent value="body">Hello body!</VerticalTabsContent>
    </VerticalTabs>
  );
}

interface SidebarEditorProps {
  block: Block;
}

function SidebarEditor({ block }: SidebarEditorProps) {
  switch (block.type) {
    case "http-request":
      return <HttpRequestSidebar block={block} />;

    default:
      return null;
  }
}

function BlockSidebar() {
  const selectedBlock = useSelectedBlockValue();

  if (selectedBlock === null) {
    return null;
  }

  return (
    <div className="absolute bottom-0 right-0 top-0 flex bg-white">
      <SidebarEditor block={selectedBlock} />
    </div>
  );
}

export { BlockSidebar };
