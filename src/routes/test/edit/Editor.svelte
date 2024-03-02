<script lang="ts">
  import { currentFile } from "$lib/stores/editor";
  import BlocksEditor from "./blocks/BlocksEditor.svelte";
  import ScriptEditor from "./ScriptEditor.svelte";
</script>

{#if $currentFile === null}
  <div class="flex flex-auto flex-col items-center justify-center text-lg">
    Create a file to start editing...
  </div>
{:else if $currentFile.type === "block"}
  <BlocksEditor file={$currentFile} />
{:else if $currentFile.type === "script"}
  <ScriptEditor file={$currentFile} />
{/if}
