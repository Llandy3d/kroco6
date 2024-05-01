<script lang="ts" context="module">
  import * as monaco from "monaco-editor";
</script>

<script lang="ts">
  import { type BrowserResponse } from "$lib/browser-types";
  import ScriptPreview from "../edit/ScriptPreview.svelte";
  import * as HoverCard from "$lib/components/ui/hover-card";
  import { Eye } from "lucide-svelte";
  import { afterUpdate } from "svelte";

  let container: HTMLDivElement;
  let editor: monaco.editor.IStandaloneCodeEditor;
  let open: boolean = false;

  afterUpdate(() => {
    if (open) {
      editor = monaco.editor.create(container, {
        value: response.content ?? "",
        language: "json",
        readOnly: true,
        minimap: { enabled: false },
        lineNumbers: "off",
      });

      return () => {
        editor.dispose();
      };
    }
  });

  export let response: BrowserResponse | null;
</script>


{#if response}
  {response.status_code}
  {#if response.content}
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
  {/if}
{:else}
  N/A
{/if}
