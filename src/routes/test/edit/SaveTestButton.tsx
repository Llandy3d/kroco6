import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { VirtualFile } from "@/lib/stores/editor";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Save } from "lucide-react";
import { useState, type ChangeEvent } from "react";

{
  /* <script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import Label from "$lib/components/ui/label/label.svelte";
  import * as Popover from "$lib/components/ui/popover";
  import { currentFile } from "$lib/stores/editor";
  import { Save } from "lucide-svelte";

  let testName = $currentFile?.name;

  function handleNameAndSave() {
    if ($currentFile === null) {
      return;
    }

    $currentFile.name = testName ?? "New test";

    saveTest();
  }

  export let saveTest: () => void;
</script> */
}

interface SaveTestButtonProps {
  file: VirtualFile;
  onSave: (file: VirtualFile) => void;
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
