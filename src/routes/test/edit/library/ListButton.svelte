<script>
  import { Button } from "$lib/components/ui/button";
  import clsx from "clsx";

  export let selected = false;

  export let onClick = () => {};
</script>

<li>
  <Button
    variant="outline"
    class={clsx("h-16 w-full justify-start rounded-none px-2", selected && "bg-gray-200")}
    on:click={onClick}><slot /></Button
  >
</li>
