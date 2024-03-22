import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/base/select";

interface Selected<Value extends string> {
  value: Value;
  label: string;
}

interface SelectInputProps<Value extends string> {
  value: Value;
  items: Selected<Value>[];
  onChange: (value: Value) => void;
}

function SelectInput<Value extends string>({
  value,
  items,
  onChange,
}: SelectInputProps<Value>) {
  function handleSelectedChange(value: string | undefined) {
    const selected = items.find((item) => item.value === value);

    if (selected === undefined) {
      return;
    }

    onChange(selected.value);
  }

  return (
    <Select value={value} onValueChange={handleSelectedChange}>
      <SelectTrigger className="h-6 gap-2 bg-white pr-1 text-xs">
        <SelectValue></SelectValue>
      </SelectTrigger>
      <SelectContent>
        {items.map(({ value, label }) => {
          return (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

export { SelectInput, type Selected };
