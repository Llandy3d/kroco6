<script lang="ts">
  import * as Select from "$lib/components/ui/select";
  import { HTTP_METHODS } from "$lib/stores/library/constants";
  import type { Selected } from "bits-ui";
  import type { OpenAPIV3 } from "openapi-types";

  export let value: string;
  export let onChange: (value: string) => void;

  const methods = HTTP_METHODS.map((method) => {
    return {
      value: method,
      label: method.toUpperCase(),
    };
  });

  const selected = methods.find((method) => method.value === value);

  function handleSelectedChange(value: Selected<OpenAPIV3.HttpMethods> | undefined) {
    if (value === undefined) {
      return;
    }

    onChange(value.value);
  }
</script>

<Select.Root items={methods} {selected} onSelectedChange={handleSelectedChange}>
  <Select.Trigger class="h-6 bg-white">
    <Select.Value></Select.Value>
  </Select.Trigger>
  <Select.Content sameWidth={false}>
    {#each methods as { value, label }}
      <Select.Item {value}>{label}</Select.Item>
    {/each}
  </Select.Content>
</Select.Root>
