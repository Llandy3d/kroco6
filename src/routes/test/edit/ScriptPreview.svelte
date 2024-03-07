<script lang="ts" context="module">
  import * as monaco from "monaco-editor";
</script>

<script lang="ts">
  import type { CloudTest } from "$lib/backend-client";
  import * as HoverCard from "$lib/components/ui/hover-card";
  import { Eye } from "lucide-svelte";
  import { afterUpdate } from "svelte";

  let container: HTMLDivElement;
  let editor: monaco.editor.IStandaloneCodeEditor;
  let open: boolean = false;

  afterUpdate(() => {
    if (open) {
      editor = monaco.editor.create(container, {
        value: test.script ?? "",
        language: "javascript",
        readOnly: true,
        minimap: { enabled: false },
        lineNumbers: "off",
      });

      return () => {
        editor.dispose();
      };
    }
  });

  export let test: CloudTest;
</script>

<HoverCard.Root bind:open openDelay={100}>
  <HoverCard.Trigger
    href=""
    class="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-black"
  >
    <Eye size="16" />
  </HoverCard.Trigger>
  <HoverCard.Content class="w-[600px]">
    <div class="h-[400px] w-full" bind:this={container}></div>
  </HoverCard.Content>
</HoverCard.Root>
