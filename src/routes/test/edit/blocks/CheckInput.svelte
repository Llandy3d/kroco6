<script context="module">
  const labels = {
    "has-status": "has status",
    "body-contains": "body contains",
  };
</script>

<script lang="ts">
  import StringInput, { type StringInputChangeEvent } from "./inputs/StringInput.svelte";
  import Field from "./primitives/Field.svelte";
  import * as Select from "$lib/components/ui/select";
  import type { CheckExpression } from "$lib/store/test/types";
  import { createEventDispatcher } from "svelte";
  import type { Selected } from "bits-ui";
  import { exhaustive } from "$lib/utils/typescript";
  import { XIcon } from "lucide-svelte";

  export let check: CheckExpression;

  const dispatch = createEventDispatcher<{ change: CheckExpression; remove: CheckExpression }>();

  const handleStatusChange = (event: CustomEvent<StringInputChangeEvent>) => {
    dispatch("change", {
      type: "has-status",
      id: check.id,
      status: +event.detail.value,
    });
  };

  const handleBodyContainsChange = (event: CustomEvent<StringInputChangeEvent>) => {
    dispatch("change", {
      type: "body-contains",
      id: check.id,
      value: event.detail.value,
    });
  };

  const handleSelectedChange = (selected: Selected<CheckExpression["type"]> | undefined) => {
    if (selected === undefined) {
      return;
    }

    switch (selected.value) {
      case "has-status":
        dispatch("change", {
          type: "has-status",
          id: check.id,
          status: 200,
        });
        break;

      case "body-contains":
        dispatch("change", {
          type: "body-contains",
          id: check.id,
          value: "",
        });

        break;

      default:
        return exhaustive(selected.value);
    }
  };

  const handleRemove = () => {
    dispatch("remove", check);
  };
</script>

<Field class="bg-orange-200">
  <Select.Root
    selected={{ value: check.type, label: labels[check.type] }}
    onSelectedChange={handleSelectedChange}
  >
    <Select.Trigger class="flex h-auto w-min items-center bg-white p-1">
      <Select.Value placeholder="has-status" />
    </Select.Trigger>
    <Select.Content sameWidth={false}>
      <Select.Item value="has-status" label={labels["has-status"]}
        >{labels["has-status"]}
      </Select.Item>
      <Select.Item value="body-contains" label={labels["body-contains"]}
        >{labels["body-contains"]}
      </Select.Item>
    </Select.Content>
  </Select.Root>

  {#if check.type === "has-status"}
    {#key check.type}
      <StringInput size={3} value={check.status} on:change={handleStatusChange} />
    {/key}
  {:else if check.type === "body-contains"}
    {#key check.type}
      <StringInput size={10} value={check.value} on:change={handleBodyContainsChange} />
    {/key}
  {/if}

  <button on:click={handleRemove}><XIcon size={14} /></button>
</Field>
