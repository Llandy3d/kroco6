<script lang="ts" context="module">
  const COLORS: { [P in OpenAPIV3.HttpMethods]: string } = {
    get: "bg-green-500",
    post: "bg-yellow-500",
    put: "bg-yellow-500",
    delete: "bg-red-500",
    head: "bg-green-500",
    options: "bg-green-500",
    patch: "bg-yellow-500",
    trace: "bg-green-500",
  };
</script>

<script lang="ts">
  import Badge from "$lib/components/ui/badge/badge.svelte";
  import { cn } from "$lib/utils";
  import type { OpenAPIV3 } from "openapi-types";

  export let method: OpenAPIV3.HttpMethods;
</script>

<Badge
  class={cn(
    "method-badge mr-2 h-8 w-14 justify-center text-white hover:bg-current",
    COLORS[method],
    "hover:" + COLORS[method],
  )}
>
  {method.toUpperCase()}
</Badge>

<style>
  :global(.method-badge) {
    font-size: 0.625rem;
  }
</style>
