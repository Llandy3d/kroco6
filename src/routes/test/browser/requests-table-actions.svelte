<script lang="ts">
  import { ShieldEllipsis } from "lucide-svelte";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Button } from "$lib/components/ui/button";
  import { data } from "./requests-store";

  function deleteEntry() {
    data.update(items => {
      // TODO: possibly unselect the item before deletion
      return items.filter(item => item.id !== id);
    });
  }

  function deleteEntryMultiple() {
    data.update(items => {
      // TODO: possibly unselect the item before deletion

      // this sucks but oh well
      const entry = items.find(item => item.id === id);
      return items.filter(item => {
        return !(item.method === entry.method && item.path === entry.path && item.content === entry.content && item.host === entry.host)
      });
    });
  }


  function deleteEntryMultipleByPath() {
    data.update(items => {
      // TODO: possibly unselect the item before deletion

      // this sucks but oh well
      const entry = items.find(item => item.id === id);
      return items.filter(item => {
        return !(item.path === entry.path)
      });
    });
  }

  function deleteEntryMultipleByHost() {
    data.update(items => {
      // TODO: possibly unselect the item before deletion

      // this sucks but oh well
      const entry = items.find(item => item.id === id);
      return items.filter(item => {
        return !(item.host === entry.host)
      });
    });

  }

  // TODO: implement method to delete all similar entries by path
 
  export let id: string;
</script>
 
<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild let:builder>
    <Button
      variant="ghost"
      builders={[builder]}
      size="icon"
      class="relative h-8 w-8 p-0"
    >
      <span class="sr-only">Open menu</span>
      <ShieldEllipsis class="h-4 w-4" />
    </Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Group>
      <DropdownMenu.Label>Actions</DropdownMenu.Label>
      <DropdownMenu.Item on:click={deleteEntry}>
        Delete entry
      </DropdownMenu.Item>
    </DropdownMenu.Group>
    <DropdownMenu.Separator />
    <DropdownMenu.Item on:click={deleteEntryMultiple}>Delete all similar entries</DropdownMenu.Item>

    <DropdownMenu.Separator />
    <DropdownMenu.Group>
      <DropdownMenu.Label>Dangerous</DropdownMenu.Label>
      <DropdownMenu.Item on:click={deleteEntryMultipleByPath}>
        Delete all entries with same Path
      </DropdownMenu.Item>
      <DropdownMenu.Item on:click={deleteEntryMultipleByHost}>
        Delete all entries with same Host
      </DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>

