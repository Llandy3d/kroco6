<!-- <script> -->
<!--     import { Badge } from "$lib/components/ui/badge"; -->
<!--     import { Separator } from "$lib/components/ui/separator"; -->
<!--     let projects = ["Default Project"]; -->
<!-- </script> -->

<!-- <div class="flex-col h-screen bg-gray-500 text-center py-4"> -->
<!--     <Badge>Projects</Badge> -->
<!--     {#each projects as project} -->
<!--         <p>{project}</p> -->
<!--         <Separator /> -->
<!--     {/each} -->
    
<!-- </div> -->

<script lang="ts">
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import { PlusCircle } from 'lucide-svelte';
    import { Separator } from "$lib/components/ui/separator";
    import { Badge } from "$lib/components/ui/badge";
    import { Check, ChevronsUpDown } from "lucide-svelte";
    import * as Command from "$lib/components/ui/command";
    import * as Popover from "$lib/components/ui/popover";
    import { Button } from "$lib/components/ui/button";
    import { cn } from "$lib/utils";
    import { tick } from "svelte";

    let projects = [
      {
        value: "default-project",
        label: "Default Project"
      },
    ];

    let open = false;
    let value = "default-project";

    $: selectedValue =
      projects.find((f) => f.value === value)?.label ?? "Select a project...";

    // We want to refocus the trigger button when the user selects
    // an item from the list so users can continue navigating the
    // rest of the form with the keyboard.
    function closeAndFocusTrigger(triggerId: string) {
      open = false;
      tick().then(() => {
        document.getElementById(triggerId)?.focus();
      });
    }
</script>


<div class="flex-col h-screen bg-gray-500 text-center py-4">
    <Badge class="block">Projects</Badge>

    <Popover.Root bind:open let:ids>
      <Popover.Trigger asChild let:builder>
        <Button
          builders={[builder]}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          class="my-2"
        >
          {selectedValue}
          <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </Popover.Trigger>
      <Popover.Content class="w-[200px] p-0">
        <Command.Root>
          <Command.Input placeholder="Search project..." />
          <Command.Empty>No project found.</Command.Empty>
          <Command.Group>
            {#each projects as project}
              <Command.Item
                value={project.value}
                onSelect={(currentValue) => {
                  value = currentValue;
                  closeAndFocusTrigger(ids.trigger);
                }}
              >
                <Check
                  class={cn(
                    "mr-2 h-4 w-4",
                    value !== project.value && "text-transparent"
                  )}
                />
                {project.label}
              </Command.Item>
            {/each}
          </Command.Group>
          <Separator />
          <Command.Group>
              <Command.Item>
                <AlertDialog.Root>
                  <AlertDialog.Trigger>
                    <PlusCircle class="mr-1" />
                    Create a new project
                  </AlertDialog.Trigger>
                  <AlertDialog.Content>
                    <AlertDialog.Header>
                      <AlertDialog.Title>Subscription required!</AlertDialog.Title>
                      <AlertDialog.Description>
                        Please subscribe to create more projects.... nah it just isn't implemented yet :)
                      </AlertDialog.Description>
                    </AlertDialog.Header>
                    <AlertDialog.Footer>
                      <AlertDialog.Cancel>Close</AlertDialog.Cancel>
                    </AlertDialog.Footer>
                  </AlertDialog.Content>
                </AlertDialog.Root>
              </Command.Item>
          </Command.Group>
        </Command.Root>
      </Popover.Content>
    </Popover.Root>

</div>
