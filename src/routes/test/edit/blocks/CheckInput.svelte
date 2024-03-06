<script lang="ts" context="module">
  const items: Selected<Check["type"]>[] = [
    { value: "status", label: "had status" },
    { value: "contains", label: "body contained" },
  ];
</script>

<script lang="ts">
  import type { Check } from "$lib/stores/blocks/model/strict";
  import { exhaustive } from "$lib/utils/typescript";
  import type { Selected } from "bits-ui";
  import { XIcon } from "lucide-svelte";
  import SelectInput from "./inputs/SelectInput.svelte";
  import StringInput from "./inputs/StringInput.svelte";
  import Field from "./primitives/Field.svelte";

  export let check: Check;

  export let onChange: (check: Check) => void;
  export let onRemove: (check: Check) => void;

  const handleStatusChange = (value: string) => {
    onChange({
      type: "status",
      id: check.id,
      value: +value,
    });
  };

  const handleBodyContainsChange = (value: string) => {
    onChange({
      type: "contains",
      id: check.id,
      value: value,
    });
  };

  const handleSelectedChange = (selected: Check["type"]) => {
    switch (selected) {
      case "status":
        onChange({
          type: "status",
          id: check.id,
          value: 200,
        });
        break;

      case "contains":
        onChange({
          type: "contains",
          id: check.id,
          value: "",
        });

        break;

      default:
        return exhaustive(selected);
    }
  };

  const handleRemove = () => {
    onRemove(check);
  };
</script>

<Field>
  <SelectInput value={check.type} {items} onChange={handleSelectedChange} />

  {#if check.type === "status"}
    {#key check.type}
      <StringInput size={3} value={check.value} onChange={handleStatusChange} />
    {/key}
  {:else if check.type === "contains"}
    {#key check.type}
      <StringInput size={10} value={check.value} onChange={handleBodyContainsChange} />
    {/key}
  {/if}

  <button on:click={handleRemove}><XIcon size={14} /></button>
</Field>
