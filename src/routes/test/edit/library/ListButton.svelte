<script>
  import { Button } from "bits-ui";
  import clsx from "clsx";

  export let selected = false;

  export let onClick = () => {};
</script>

<li class="border-b-[1px] first-of-type:border-t-[1px]">
  <Button.Root
    class={clsx(
      "h-16 w-full justify-start rounded-none  px-2  hover:bg-secondary",
      selected && "bg-gray-200",
    )}
    on:click={onClick}><slot /></Button.Root
  >
</li>
