<script lang="ts" context="module">
  export interface StringInputChangeEvent {
    value: string;
  }
</script>

<script lang="ts">
  import type { InputEvents } from "$lib/components/ui/input";

  import Input from "$lib/components/ui/input/input.svelte";

  export let onChange: (value: string) => void;

  function handleChange(ev: InputEvents["change"]) {
    if (ev.target instanceof HTMLInputElement) {
      onChange(ev.target.value);
    }
  }
</script>

<Input {...$$restProps} class="h-6 w-auto bg-white p-1 text-xs" on:change={handleChange} />
