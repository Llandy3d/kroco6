<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import { library, syncLibrary, updateEndpoint } from "$lib/stores/library";
  import { HTTP_METHODS } from "$lib/stores/library/constants";
  import type { ApiEndpoint, ApiOperation } from "$lib/stores/library/types";
  import { Plus, RefreshCcw } from "lucide-svelte";
  import { derived, type Readable } from "svelte/store";
  import ApiPath from "./ApiPath.svelte";
  import EndpointEditor from "./EndpointEditor.svelte";
  import ImportDialog, { type ImportEvent } from "./SyncDialog.svelte";

  let importModalOpen = false;

  let selected: ApiOperation | undefined;

  const endpoints: Readable<ApiEndpoint[]> = derived(library, ($library) => {
    const paths = Object.entries($library.paths ?? {});

    return paths.flatMap(([path, value]) => {
      if (value === undefined) {
        return [];
      }

      return {
        path,
        details: value,
        operations: HTTP_METHODS.flatMap((method) => {
          const details = value[method];

          if (details === undefined) {
            return [];
          }

          return {
            path,
            method,
            details,
          };
        }),
      };
    });
  });

  $: endpoint = $endpoints.find((endpoint) => endpoint.path === selected?.path);

  const handleSyncClick = () => {
    importModalOpen = true;
  };

  const handleImport = (event: CustomEvent<ImportEvent>) => {
    // For now we only support V3
    if (!("openapi" in event.detail.api)) {
      return;
    }

    syncLibrary(event.detail.api);
  };

  function handleItemSelected(operation: ApiOperation) {
    selected = operation;
  }

  function handleEndpointChange(target: ApiEndpoint) {
    if (endpoint === undefined) {
      return;
    }

    updateEndpoint(endpoint, target);

    // If the path has changed, we have to make sure that the
    // selected operation is also updated.
    selected = selected && {
      ...selected,
      path: target.path,
    };
  }
</script>

<div class="flex h-full flex-col">
  <div class="flex flex-auto">
    <div class="flex h-full w-96 flex-col gap-4 bg-accent p-2">
      <h2 class="flex items-center justify-between font-bold">
        <span>{$library.info.title}</span>
        <Button class="gap-2" variant="ghost" size="sm" on:click={handleSyncClick}
          ><RefreshCcw size={14} /> Sync</Button
        >
      </h2>
      <ul class="list-none">
        {#each $endpoints as endpoint (endpoint.path)}
          <ApiPath {endpoint} {selected} onItemSelected={handleItemSelected} />
        {/each}
      </ul>
      <div class="flex gap-2">
        <Button class="flex-1 gap-2"><Plus /> Add</Button>
      </div>
    </div>
    <div class="flex flex-auto flex-col p-4">
      {#if endpoint !== undefined && selected !== undefined}
        <EndpointEditor
          selected={selected.method}
          {endpoint}
          onChange={handleEndpointChange}
          onOperationSelected={handleItemSelected}
        />
      {/if}
    </div>
  </div>
</div>

<ImportDialog bind:open={importModalOpen} on:imported={handleImport} />
