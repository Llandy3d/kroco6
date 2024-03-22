import type { Check } from "@/lib/stores/blocks/model/strict";
import { exhaustive } from "@/lib/utils/typescript";
import {
  SelectInput,
  type Selected,
} from "@/views/editor/tabs/blocks-editor/inputs/SelectInput";
import { StringInput } from "@/views/editor/tabs/blocks-editor/inputs/StringInput";
import { Field } from "@/views/editor/tabs/blocks-editor/primitives/Field";
import { X } from "lucide-react";

const items: Selected<Check["type"]>[] = [
  { value: "status", label: "had status" },
  { value: "contains", label: "body contained" },
];

export let check: Check;

export let onChange: (check: Check) => void;
export let onRemove: (check: Check) => void;

interface CheckInputProps {
  check: Check;
  onChange: (check: Check) => void;
  onRemove: (check: Check) => void;
}

export function CheckInput({ check, onChange, onRemove }: CheckInputProps) {
  const handleStatusChange = (value: string) => {
    onChange({
      type: "status",
      id: check.id,
      value: +value,
    });
  };

  const handleBodyContainsChange = (value: string) => {
    onChange({
      type: "contains",
      id: check.id,
      value: value,
    });
  };

  const handleSelectedChange = (selected: Check["type"]) => {
    switch (selected) {
      case "status":
        onChange({
          type: "status",
          id: check.id,
          value: 200,
        });
        break;

      case "contains":
        onChange({
          type: "contains",
          id: check.id,
          value: "",
        });

        break;

      default:
        return exhaustive(selected);
    }
  };

  const handleRemove = () => {
    onRemove(check);
  };

  return (
    <Field>
      <SelectInput
        value={check.type}
        items={items}
        onChange={handleSelectedChange}
      />

      {check.type === "status" && (
        <StringInput
          size={3}
          value={check.value}
          onChange={handleStatusChange}
        />
      )}

      {check.type === "contains" && (
        <StringInput
          size={10}
          value={check.value}
          onChange={handleBodyContainsChange}
        />
      )}

      <button onClick={handleRemove}>
        <X size={14} />
      </button>
    </Field>
  );
}
