import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectItem {
  value: string;
  label: string;
}

interface SelectInputProps {
  value: string;
  items: SelectItem[];
  onChange: (value: string) => void;
}

function SelectInput<Value>({ value, items, onChange }: SelectInputProps) {
  function handleSelectedChange(value: string | undefined) {
    if (value === undefined) {
      return;
    }

    onChange(value);
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

export { SelectInput };
