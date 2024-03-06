<script lang="ts">
  import { Tabs } from "bits-ui";
  export let value: string;
</script>

<Tabs.Trigger
  class="flex w-32 items-center justify-center gap-2 border-r-[1px] px-6 py-2 font-extralight data-[state=active]:font-normal data-[state=active]:text-primary"
  {value}
>
  <slot />
</Tabs.Trigger>
