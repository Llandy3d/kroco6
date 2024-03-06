<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Container, Trash2 } from "lucide-svelte";

  import { type Environment } from "$lib/backend-client";
  import type { InputEvents } from "cmdk-sv";
  import Input from "./ui/input/input.svelte";

  // The environment object is assumed to be loaded and bounded from the parent
  // component that is using this component.
  export let environment: Environment;

  function handleNameEdit(event: InputEvents["change"], originalName: string) {
    if (event.target instanceof HTMLInputElement) {
      const name = event.target.value.trim();

      const { [originalName]: originalValue, ...rest } = environment.variables;

      environment = {
        ...environment,
        variables: {
          ...rest,
          [name]: originalValue ?? "",
        },
      };
    }
  }

  function handleValueEdit(event: InputEvents["change"], name: string) {
    if (event.target instanceof HTMLInputElement) {
      const value = event.target.value.trim();

      environment = {
        ...environment,
        variables: {
          ...environment.variables,
          [name]: value,
        },
      };
    }
  }

  function handleDelete(name: string) {
    const { [name]: _, ...newVariables } = environment.variables;

    environment = {
      ...environment,
      variables: newVariables,
    };
  }

  function handleAddVariable() {
    environment.variables = {
      ...environment.variables,
      [""]: "",
    };
  }
</script>

<Dialog.Root>
  <Dialog.Trigger>
    <div class="flex items-center gap-2">
      <Container size="14" />
      {environment.name}
    </div>
  </Dialog.Trigger>

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
                <td>
                  <Input
                    class="border-none"
                    value={name}
                    on:change={(event) => handleNameEdit(event, name)}
                  />
                </td>
                <td>
                  <Input
                    class="border-none"
                    {value}
                    on:change={(event) => handleValueEdit(event, name)}
                  />
                </td>
                <td
                  ><Button variant="outline" size="icon" on:click={(event) => handleDelete(name)}>
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
