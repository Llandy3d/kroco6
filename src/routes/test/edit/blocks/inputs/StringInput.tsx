import { Input, type InputProps } from "@/components/ui/input";
import type { ChangeEvent } from "react";

interface StringInputProps extends Omit<InputProps, "onChange" | "className"> {
  onChange: (value: string) => void;
}

function StringInput({ onChange, ...rest }: StringInputProps) {
  function handleChange(ev: ChangeEvent<HTMLInputElement>) {
    onChange(ev.target.value);
  }

  return <Input {...rest} className="h-6 w-auto bg-white p-1 text-xs" onChange={handleChange} />;
}

export { StringInput };
