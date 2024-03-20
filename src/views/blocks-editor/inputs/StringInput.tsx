import { Input, type InputProps } from "@/components/ui/input";
import type { ChangeEvent, SyntheticEvent } from "react";

interface StringInputProps extends Omit<InputProps, "onChange" | "className"> {
  onChange: (value: string) => void;
}

function StringInput({ onChange, ...rest }: StringInputProps) {
  function stopPropagation(ev: SyntheticEvent<HTMLInputElement>) {
    ev.stopPropagation();
  }

  function handleChange(ev: ChangeEvent<HTMLInputElement>) {
    onChange(ev.target.value);
  }

  return (
    <Input
      {...rest}
      className="h-6 w-auto bg-white p-1 text-xs"
      onChange={handleChange}
      onKeyDown={stopPropagation}
      onClick={stopPropagation}
      onKeyUp={stopPropagation}
    />
  );
}

export { StringInput };
