<script lang="ts">
	import { currentFile } from '$lib/store/editor';
	import BlocksEditor from './BlocksEditor.svelte';
	import Library from './Library.svelte';
	import ScriptEditor from './ScriptEditor.svelte';
</script>

{#if $currentFile === null}
	<div class="flex flex-auto flex-col items-center justify-center text-lg">
		Create a file to start editing...
	</div>
{:else if $currentFile.type === 'block'}
	<BlocksEditor file={$currentFile} />
{:else if $currentFile.type === 'script'}
	<ScriptEditor file={$currentFile} />
{:else if $currentFile.type === 'library'}
	<Library />
{/if}
