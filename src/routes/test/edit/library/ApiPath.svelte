<script lang="ts">
  import type { ApiEndpoint, ApiOperation } from "$lib/store/test/types";
  import MethodButton from "./MethodButton.svelte";
  import { Plus } from "lucide-svelte";

  export let endpoint: ApiEndpoint;
  export let selected: ApiOperation | undefined;

  export let onItemSelected: (operation: ApiOperation) => void;

  function isSameOperation(left: ApiOperation | undefined, right: ApiOperation | undefined) {
    if (left === undefined || right === undefined) {
      return false;
    }

    const leftId = left.details.operationId ?? left.method + left.path;
    const rightId = right.details.operationId ?? right.method + right.path;

    return leftId === rightId;
  }
</script>

<h3 class="flex items-center justify-between p-2 font-semibold">
  <div>
    {endpoint.path}
    {endpoint.details.summary ? ` - ${endpoint.details.summary}` : ""}
  </div>
  <div>
    <button><Plus size={14} /></button>
  </div>
</h3>
{#each endpoint.operations as operation (operation.details?.operationId ?? operation.method + operation.path)}
  <MethodButton
    selected={isSameOperation(selected, operation)}
    {operation}
    onClick={(method) => onItemSelected(operation)}
  />
{/each}
