<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import { syncLibrary, updateEndpoint } from "$lib/stores/library";
  import { HTTP_METHODS } from "$lib/stores/library/constants";
  import type { ApiEndpoint, ApiOperation } from "$lib/stores/library/types";
  import { Plus, RefreshCcw } from "lucide-svelte";
  import { derived, type Readable } from "svelte/store";
  import { getCurrentLibrary, getCurrentTest } from "../blockEditorContext";
  import ApiPath from "./ApiPath.svelte";
  import EndpointEditor from "./EndpointEditor.svelte";
  import ImportDialog, { type ImportEvent } from "./SyncDialog.svelte";

  let importModalOpen = false;

  let selected: ApiOperation | undefined;

  const test = getCurrentTest();
  const library = getCurrentLibrary();

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

    $test = syncLibrary($test, event.detail.api);
  };

  function handleItemSelected(operation: ApiOperation) {
    selected = operation;
  }

  function handleEndpointChange(target: ApiEndpoint) {
    if (endpoint === undefined) {
      return;
    }

    $test = updateEndpoint($test, endpoint, target);

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
    <div class="flex h-full w-96 flex-col gap-4 border-r-[1px] p-2">
      <h2 class="flex items-center justify-between">
        <span class="font-bold uppercase">{$library.info.title}</span>
        <Button class="gap-2" variant="ghost" size="sm" on:click={handleSyncClick}
          ><RefreshCcw size={14} /> Sync</Button
        >
      </h2>
      {#each $endpoints as endpoint (endpoint.path)}
        <div>
          <ApiPath {endpoint} {selected} onItemSelected={handleItemSelected} />
        </div>
      {/each}
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
