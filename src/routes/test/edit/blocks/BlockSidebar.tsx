import { Input } from "@/components/ui/input";
import { updateBlock } from "@/lib/stores/blocks";
import type { Block, HttpRequestBlock } from "@/lib/stores/blocks/model/loose";
import {
  VerticalTabs,
  VerticalTabsContent,
  type Tab,
} from "@/routes/test/edit/blocks/VerticalTabs";
import { useSelectedBlockValue, useSetTest } from "@/routes/test/edit/blocks/atoms";
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

interface QueryParameterInputProps {
  parameter: NameValuePair;
  onChange: (value: NameValuePair) => void;
  onCommit?: (value: NameValuePair) => void;
  onDelete?: (value: NameValuePair) => void;
}

function QueryParameterInput({
  parameter,
  onChange,
  onCommit,
  onDelete,
}: QueryParameterInputProps) {
  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    onChange({
      ...parameter,
      name: event.target.value,
    });
  }

  function handleValueChange(event: ChangeEvent<HTMLInputElement>) {
    onChange({
      ...parameter,
      value: event.target.value,
    });
  }

  function handleBlur() {
    onCommit?.(parameter);
  }

  function handleDeleteClick() {
    onDelete?.(parameter);
  }

  return (
    <div className="mb-2 flex items-center gap-2">
      <Input value={parameter.name} onBlur={handleBlur} onChange={handleNameChange} /> ={" "}
      <Input value={parameter.value} onBlur={handleBlur} onChange={handleValueChange} />
      <button className="disabled:invisible" disabled={onDelete === undefined}>
        <Trash2 size={16} onClick={handleDeleteClick} />
      </button>
    </div>
  );
}

interface QueryParameterEditorProps {
  parameters: NameValuePair[];
  onChange: (parameters: NameValuePair[]) => void;
}

function QueryParameterEditor({ parameters, onChange }: QueryParameterEditorProps) {
  const [newParameter, setNewParameter] = useState<NameValuePair>(() => ({
    id: nanoid(),
    name: "",
    value: "",
  }));

  function handleParameterChange(value: NameValuePair) {
    onChange(parameters.map((param) => (param.id === value.id ? value : param)));
  }

  function handleParameterDelete(value: NameValuePair) {
    onChange(parameters.filter((param) => param.id !== value.id));
  }

  function handleNewParameterChange(value: NameValuePair) {
    setNewParameter(value);
  }

  function handleNewParameterCommit(parameter: NameValuePair) {
    if (parameter.name === "") {
      return;
    }

    onChange([...parameters, parameter]);

    setNewParameter({
      id: nanoid(),
      name: "",
      value: "",
    });
  }

  return (
    <div>
      {[...parameters, newParameter].map((param, index) => {
        // This is a roundabout way of doing things, but it makes sure that
        // focus is kept when tabbing to the value input.
        const isNewParameter = index === parameters.length;

        return (
          <QueryParameterInput
            key={param.id}
            parameter={param}
            onChange={isNewParameter ? handleNewParameterChange : handleParameterChange}
            onCommit={isNewParameter ? handleNewParameterCommit : undefined}
            onDelete={isNewParameter ? undefined : handleParameterDelete}
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

  return (
    <VerticalTabs current={current} align="right" tabs={tabs} onChange={setCurrent}>
      <VerticalTabsContent value="parameters">
        <QueryParameterEditor parameters={block.parameters} onChange={handleParametersChange} />
      </VerticalTabsContent>
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
