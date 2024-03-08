import { useState, type ChangeEvent } from "react";

export function useInputState(initialValue: string) {
  const [value, setValue] = useState(initialValue);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setValue(event.target.value);
  }

  return [value, handleChange] as const;
}
