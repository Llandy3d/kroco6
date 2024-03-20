import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EditorTab } from "@/lib/stores/editor";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Save } from "lucide-react";
import { useState, type ChangeEvent } from "react";

interface SaveTestButtonProps {
  file: EditorTab;
  onSave: (file: EditorTab) => void;
}

function SaveTestButton({ file, onSave }: SaveTestButtonProps) {
  const [name, setName] = useState(file?.name ?? "");

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    setName(event.target.value);
  }

  function handleSave() {
    onSave(file);
  }

  function handleNameAndSave() {
    if (file === null) {
      return;
    }

    onSave({
      ...file,
      name: name,
    });
  }

  if (file === null) {
    return <div></div>;
  }

  if (file.path.type === "existing") {
    return (
      <Button variant="ghost" size="icon" className="rounded-full" onClick={handleSave}>
        <Save size={14} />
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Save size={14} />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-2">
          <Label htmlFor="k6-test-name">Test name</Label>
          <Input id="k6-test-name" className="mb-2" value={name} onChange={handleNameChange} />

          <Button size="sm" onClick={handleNameAndSave}>
            Save changes
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { SaveTestButton };
