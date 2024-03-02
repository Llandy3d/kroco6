<script lang="ts">
  import { Input, type InputEvents } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { type ApiEndpoint, HTTP_METHODS, type ApiOperation } from "$lib/stores/test/types";
  import { Tabs } from "bits-ui";
  import MethodEditor from "./MethodEditor.svelte";
  import { OpenAPIV3 } from "openapi-types";
  import clsx from "clsx";
  import { Plus } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

  export let endpoint: ApiEndpoint;
  export let selected: OpenAPIV3.HttpMethods | undefined;

  export let onChange: (target: ApiEndpoint) => void;
  export let onOperationSelected: (operation: ApiOperation) => void;

  $: unusedMethods = HTTP_METHODS.filter(
    (method) => !endpoint.operations.some((operation) => operation.method === method),
  );

  function handleSummaryChange(event: InputEvents["change"]) {
    if (event.target instanceof HTMLInputElement) {
      onChange({
        ...endpoint,
        details: {
          ...endpoint.details,
          summary: event.target.value,
        },
      });
    }
  }

  function handlePathChange(event: InputEvents["change"]) {
    if (event.target instanceof HTMLInputElement) {
      onChange({
        ...endpoint,
        path: event.target.value,
      });
    }
  }

  function handleOperationChange(operation: ApiOperation) {
    onChange({
      ...endpoint,
      details: {
        ...endpoint.details,
        [operation.method]: operation.details,
      },
    });
  }

  function handleOperationRemoved(operation: ApiOperation) {
    const details = { ...endpoint.details };

    delete details[operation.method];

    onChange({
      ...endpoint,
      details,
    });
  }

  function handleOperationSelected(value: string | undefined) {
    const operation = endpoint.operations.find((operation) => operation.method === value);

    if (operation === undefined) {
      return;
    }

    onOperationSelected(operation);
  }

  function handleAddOperation(method: OpenAPIV3.HttpMethods) {
    const newOperation: OpenAPIV3.OperationObject = {
      summary: "",
      description: "",
      responses: {},
    };

    onChange({
      ...endpoint,
      details: {
        ...endpoint.details,
        [method]: newOperation,
      },
    });

    onOperationSelected({
      path: endpoint.path,
      method,
      details: newOperation,
    });
  }
</script>

<div class="form-grid mb-4 items-center justify-end">
  <Label for="path" class="text-right">Path</Label>
  <Input id="path" value={endpoint.path} on:change={handlePathChange} />
  <Label for="summary" class="text-right">Summary</Label>
  <Input id="summary" value={endpoint.details.summary} on:change={handleSummaryChange} />
</div>

<Tabs.Root class="Root" bind:value={selected} onValueChange={handleOperationSelected}>
  <Tabs.List class="mb-4 flex border-b-2 border-slate-200">
    {#each endpoint.operations as operation (operation.method)}
      <Tabs.Trigger
        class="w-24 p-2 data-[state='active']:bg-primary data-[state='active']:text-primary-foreground"
        value={operation.method}>{operation.method.toUpperCase()}</Tabs.Trigger
      >
    {/each}
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="ghost"><Plus /></Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {#each unusedMethods as method}
          <DropdownMenu.Item class={clsx("p-2")} on:click={() => handleAddOperation(method)}
            >{method.toUpperCase()}</DropdownMenu.Item
          >
        {/each}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </Tabs.List>
  {#each endpoint.operations as operation (operation.method)}
    <Tabs.Content value={operation.method}>
      <MethodEditor
        {operation}
        onChange={handleOperationChange}
        onRemove={handleOperationRemoved}
      />
    </Tabs.Content>
  {/each}
</Tabs.Root>

<style>
  .form-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    gap: 1rem;
  }
</style>
