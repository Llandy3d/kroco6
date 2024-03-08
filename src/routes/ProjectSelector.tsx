import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import type { Project } from "@/lib/backend-client";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, PlusCircle } from "lucide-react";
import { useState } from "react";
import { CreateProjectDialog } from "./CreateProjectDialog";

{
  /* <script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Command from "$lib/components/ui/command";
  import * as Popover from "$lib/components/ui/popover";
  import { Separator } from "$lib/components/ui/separator";
  import { activeProject, projects } from "$lib/stores/projects";
  import { cn } from "$lib/utils";
  import { Check, ChevronDown, PlusCircle } from "lucide-svelte";
  import { tick } from "svelte";
  import CreateProjectDialog from "./CreateProjectDialog.svelte";

  let open = false;
  let createDialogOpen = false;

  // We want to refocus the trigger button when the user selects
  // an item from the list so users can continue navigating the
  // rest of the form with the keyboard.
  async function closeAndFocusTrigger(triggerId: string) {
    open = false;
    await tick();
    document.getElementById(triggerId)?.focus();
  }
</script> */
}

interface ProjectSelectorProps {
  active: Project;
  projects: Project[];
  onChange: (project: Project) => void;
  onCreate: (project: Project) => void;
}

function ProjectSelector({ active, projects, onChange, onCreate }: ProjectSelectorProps) {
  const [open, setOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  function handleOpenChange(value: boolean) {
    setOpen(value);
  }

  function handleActiveProjectChange(value: string) {
    const project = projects.find((project) => project.name === value);

    if (project === undefined) {
      return;
    }

    onChange(project);
  }

  function handleCreateDialogDismiss() {
    setCreateDialogOpen(false);
  }

  function handleCreateProject(project: Project) {
    setCreateDialogOpen(false);

    onCreate(project);
  }

  return (
    <>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="self-strech flex justify-between"
          >
            {active.name}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="rounded-none p-0">
          <Command>
            <CommandInput placeholder="Search project..." />
            <CommandEmpty>No project found.</CommandEmpty>
            <CommandGroup>
              {projects.map((project) => {
                return (
                  <CommandItem
                    key={project.name}
                    value={project.name}
                    onSelect={handleActiveProjectChange}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        active.name !== project.name && "text-transparent",
                      )}
                    />
                    {project.name}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <Separator />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setCreateDialogOpen(true);
                  setOpen(false);
                }}
              >
                <PlusCircle className="mr-2" size={16} />
                Create a new project
              </CommandItem>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      <CreateProjectDialog
        open={createDialogOpen}
        onDismiss={handleCreateDialogDismiss}
        onCreate={handleCreateProject}
      />
    </>
  );
}

export { ProjectSelector };
