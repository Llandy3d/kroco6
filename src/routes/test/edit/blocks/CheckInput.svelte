<script context="module">
  const labels = {
    status: "has status",
    contains: "body contains",
  };
</script>

<script lang="ts">
  import * as Select from "$lib/components/ui/select";
  import type { Check } from "$lib/stores/blocks/model/strict";
  import { exhaustive } from "$lib/utils/typescript";
  import type { Selected } from "bits-ui";
  import { XIcon } from "lucide-svelte";
  import StringInput, { type StringInputChangeEvent } from "./inputs/StringInput.svelte";
  import Field from "./primitives/Field.svelte";

  export let check: Check;
  export let onChange: (check: Check) => void;
  export let onRemove: (check: Check) => void;

  const handleStatusChange = (event: CustomEvent<StringInputChangeEvent>) => {
    onChange({
      type: "status",
      id: check.id,
      value: +event.detail.value,
    });
  };

  const handleBodyContainsChange = (event: CustomEvent<StringInputChangeEvent>) => {
    onChange({
      type: "contains",
      id: check.id,
      value: event.detail.value,
    });
  };

  const handleSelectedChange = (selected: Selected<Check["type"]> | undefined) => {
    if (selected === undefined) {
      return;
    }

    switch (selected.value) {
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
        return exhaustive(selected.value);
    }
  };

  const handleRemove = () => {
    onRemove(check);
  };
</script>

<Field class="bg-orange-200">
  <Select.Root
    selected={{ value: check.type, label: labels[check.type] }}
    onSelectedChange={handleSelectedChange}
  >
    <Select.Trigger class="flex h-auto w-min items-center bg-white p-1">
      <Select.Value placeholder="status" />
    </Select.Trigger>
    <Select.Content sameWidth={false}>
      <Select.Item value="status" label={labels["status"]}>{labels["status"]}</Select.Item>
      <Select.Item value="contains" label={labels["contains"]}>{labels["contains"]}</Select.Item>
    </Select.Content>
  </Select.Root>

  {#if check.type === "status"}
    {#key check.type}
      <StringInput size={3} value={check.value} on:change={handleStatusChange} />
    {/key}
  {:else if check.type === "contains"}
    {#key check.type}
      <StringInput size={10} value={check.value} on:change={handleBodyContainsChange} />
    {/key}
  {/if}

  <button on:click={handleRemove}><XIcon size={14} /></button>
</Field>
