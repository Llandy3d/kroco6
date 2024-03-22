import { Input } from "@/components/base/input";
import { updateBlock } from "@/lib/stores/blocks";
import type { Block, HttpRequestBlock } from "@/lib/stores/blocks/model/loose";
import {
  VerticalTabs,
  VerticalTabsContent,
  type Tab,
} from "@/views/editor/tabs/blocks-editor/VerticalTabs";
import {
  useSelectedBlockValue,
  useSetTest,
} from "@/views/editor/tabs/blocks-editor/atoms";
import { Handshake, PackageOpen, Trash2, Variable } from "lucide-react";
import { nanoid } from "nanoid";
import { useState, type ChangeEvent } from "react";

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

interface NameValuePair {
  id: string;
  name: string;
  value: string;
}

interface NameValueInputProps {
  entry: NameValuePair;
  onChange: (value: NameValuePair) => void;
  onCommit?: (value: NameValuePair) => void;
  onDelete?: (value: NameValuePair) => void;
}

function NameValueInput({
  entry,
  onChange,
  onCommit,
  onDelete,
}: NameValueInputProps) {
  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    onChange({
      ...entry,
      name: event.target.value,
    });
  }

  function handleValueChange(event: ChangeEvent<HTMLInputElement>) {
    onChange({
      ...entry,
      value: event.target.value,
    });
  }

  function handleBlur() {
    onCommit?.(entry);
  }

  function handleDeleteClick() {
    onDelete?.(entry);
  }

  return (
    <div className="mb-2 flex items-center gap-2">
      <Input
        value={entry.name}
        placeholder="Name"
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        onBlur={handleBlur}
        onChange={handleNameChange}
      />{" "}
      ={" "}
      <Input
        value={entry.value}
        placeholder="Value"
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        onBlur={handleBlur}
        onChange={handleValueChange}
      />
      <button className="disabled:invisible" disabled={onDelete === undefined}>
        <Trash2 size={16} onClick={handleDeleteClick} />
      </button>
    </div>
  );
}

interface NameValueEditorProps {
  entries: NameValuePair[];
  onChange: (entry: NameValuePair[]) => void;
}

function NameValueEditor({ entries, onChange }: NameValueEditorProps) {
  const [newEntry, setNewEntry] = useState<NameValuePair>(() => ({
    id: nanoid(),
    name: "",
    value: "",
  }));

  function handleEntryChange(value: NameValuePair) {
    onChange(entries.map((param) => (param.id === value.id ? value : param)));
  }

  function handleEntryDelete(value: NameValuePair) {
    onChange(entries.filter((param) => param.id !== value.id));
  }

  function handleNewEntryChange(value: NameValuePair) {
    setNewEntry(value);
  }

  function handleEntryCommit(parameter: NameValuePair) {
    if (parameter.name === "") {
      return;
    }

    onChange([...entries, parameter]);

    setNewEntry({
      id: nanoid(),
      name: "",
      value: "",
    });
  }

  return (
    <div>
      {[...entries, newEntry].map((entry, index) => {
        // This is a roundabout way of doing things, but it makes sure that
        // focus is kept when tabbing to the value input.
        const isNewEntry = index === entries.length;

        return (
          <NameValueInput
            key={entry.id}
            entry={entry}
            onChange={isNewEntry ? handleNewEntryChange : handleEntryChange}
            onCommit={isNewEntry ? handleEntryCommit : undefined}
            onDelete={isNewEntry ? undefined : handleEntryDelete}
          />
        );
      })}
    </div>
  );
}

interface HttpRequestSidebarProps {
  block: HttpRequestBlock;
}

function HttpRequestSidebar({ block }: HttpRequestSidebarProps) {
  const setTest = useSetTest();
  const [current, setCurrent] = useState(STATIC_TABS[0]);

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

  function handleParametersChange(parameters: NameValuePair[]) {
    setTest((test) =>
      updateBlock(test, {
        ...block,
        parameters,
      }),
    );
  }

  function handleHeadersChange(headers: NameValuePair[]) {
    setTest((test) =>
      updateBlock(test, {
        ...block,
        headers,
      }),
    );
  }

  return (
    <VerticalTabs
      current={current}
      align="right"
      tabs={tabs}
      onChange={setCurrent}
    >
      <VerticalTabsContent className="min-w-[32rem]" value="parameters">
        <div className="p-2">
          <h2 className="text-l mb-4 font-semibold uppercase">
            Query parameters
          </h2>
          <NameValueEditor
            entries={block.parameters}
            onChange={handleParametersChange}
          />
        </div>
      </VerticalTabsContent>
      <VerticalTabsContent className="min-w-[32rem]" value="headers">
        <div className="p-2">
          <h2 className="text-l mb-4 font-semibold uppercase">Headers</h2>
          <NameValueEditor
            entries={block.headers}
            onChange={handleHeadersChange}
          />
        </div>
      </VerticalTabsContent>
      <VerticalTabsContent className="min-w-[32rem]" value="body">
        Hello body!
      </VerticalTabsContent>
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
    <div className="absolute bottom-0 right-0 top-0 flex  bg-white">
      <SidebarEditor block={selectedBlock} />
    </div>
  );
}

export { BlockSidebar };
