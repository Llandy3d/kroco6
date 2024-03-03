<script lang="ts">
  import { currentFile } from "$lib/stores/editor";
  import BlocksEditor from "./blocks/BlocksEditor.svelte";
  import EmptyEditor from "./EmptyEditor.svelte";
  import ScriptEditor from "./ScriptEditor.svelte";
</script>

{#if $currentFile === null}
  <EmptyEditor />
{:else if $currentFile.type === "block"}
  <BlocksEditor file={$currentFile} />
{:else if $currentFile.type === "script"}
  <ScriptEditor file={$currentFile} />
{/if}
