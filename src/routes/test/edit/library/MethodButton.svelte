<script lang="ts">
  import type { ApiOperation } from "$lib/stores/library/types";
  import ListButton from "./ListButton.svelte";
  import MethodBadge from "./MethodBadge.svelte";

  export let selected: boolean;
  export let operation: ApiOperation;

  export let onClick: (operation: ApiOperation) => void;
</script>

<ListButton {selected} onClick={() => onClick(operation)}>
  <div class="flex items-center">
    <MethodBadge method={operation.method} />
    <div class="flex flex-col items-start">
      <div class="font-bold">{operation.details.summary || operation.path}</div>
      {#if operation.details.summary}
        <div class="text-xs text-gray-500">{operation.path}</div>
      {/if}
    </div>
  </div>
</ListButton>
