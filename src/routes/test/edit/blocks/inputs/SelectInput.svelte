<script lang="ts" generics="Value extends string">
  import * as Select from "$lib/components/ui/select";
  import type { Selected } from "bits-ui";

  export let value: Value;
  export let items: Selected<Value>[];
  export let onChange: (value: Value) => void;

  function handleSelectedChange(value: Selected<Value> | undefined) {
    if (value === undefined) {
      return;
    }

    onChange(value.value);
  }

  const selected = items.find((item) => item.value === value);
</script>

<Select.Root {items} {selected} onSelectedChange={handleSelectedChange}>
  <Select.Trigger class="h-6 bg-white text-xs">
    <Select.Value></Select.Value>
  </Select.Trigger>
  <Select.Content sameWidth={false}>
    {#each items as { value, label }}
      <Select.Item {value}>{label}</Select.Item>
    {/each}
  </Select.Content>
</Select.Root>
