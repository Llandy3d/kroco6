<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Trash2 } from "lucide-svelte";

  import { type Environment } from "$lib/backend-client";

  // The environment object is assumed to be loaded and bounded from the parent
  // component that is using this component.
  export let environment: Environment;

  let tempName: string | null = null;
  function handleEditStart(name: string) {
    tempName = name;
  }

  function handleNameEdit(event: any, originalName: string) {
    const newName = event.target.textContent.trim();
    if (newName && newName !== originalName) {
      if (environment.variables.hasOwnProperty(newName)) {
        console.error("Duplicate key name.");
        return;
      }

      environment.variables[newName] = environment.variables[originalName];
      delete environment.variables[originalName];
    }
  }

  function handleValueEdit(event: any, name: string) {
    environment.variables[name] = event.target.textContent;
  }

  function handleDelete(event: any, name: string) {
    delete environment.variables[name];
  }

  function handleAddVariable() {
    environment.variables[""] = "";
  }
</script>

<Dialog.Root>
  <Dialog.Trigger>{environment.name}</Dialog.Trigger>

  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title
        >{environment.name.charAt(0).toUpperCase() + environment.name.slice(1)} Environment</Dialog.Title
      >
      <Dialog.Description>
        <table class="min-w-full divide-y divide-gray-300">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                >Name</th
              >
              <th
                scope="col"
                class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                >Value</th
              >
              <th
                scope="col"
                class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              ></th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200 bg-white">
            {#each Object.entries(environment.variables) as [name, value]}
              <tr>
                <td
                  contenteditable="true"
                  on:blur={(event) => handleNameEdit(event, name)}
                  on:focus={() => handleEditStart(name)}>{name}</td
                >
                <td contenteditable="true" on:blur={(event) => handleValueEdit(event, name)}
                  >{value}</td
                >
                <td
                  ><Button
                    variant="outline"
                    size="icon"
                    on:click={(event) => handleDelete(event, name)}
                  >
                    <Trash2 size="16" />
                  </Button></td
                >
              </tr>
            {/each}
          </tbody>
        </table>

        <Button variant="link" on:click={handleAddVariable}>+ Add Variable</Button>
      </Dialog.Description>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>
