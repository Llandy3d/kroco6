<script lang="ts">
  import { Label } from "$lib/components/ui/label";
  import type { ApiOperation } from "$lib/stores/test/types";
  import { Input } from "$lib/components/ui/input";
  import type { InputEvents } from "cmdk-sv";

  export let operation: ApiOperation;

  export let onChange: (target: ApiOperation) => void;
  export let onRemove: (target: ApiOperation) => void;

  function handleSummaryChange(event: InputEvents["change"]) {
    if (event.target instanceof HTMLInputElement) {
      onChange({
        ...operation,
        details: {
          ...operation.details,
          summary: event.target.value,
        },
      });
    }
  }
</script>

<div class="form-grid">
  <Label for="operation-summary">Summary</Label>
  <Input id="operation-summary" value={operation.details.summary} on:change={handleSummaryChange} />
</div>

<style>
  .form-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    align-items: center;
    gap: 1rem;
  }
</style>
