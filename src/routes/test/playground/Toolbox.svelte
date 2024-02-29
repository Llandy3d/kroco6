<script lang="ts">
	import type { Block } from '$lib/store/test/types';
	import AnyBlock from './blocks/AnyBlock.svelte';
	import { dropmask } from './blocks/primitives/dnd';
	import { selected, requests } from '$lib/store/test';
	import { exhaustive } from '../../../utils/typescript';

	const TEMPLATES: Block[] = [
		{
			id: 'scenario-template',
			type: 'scenario',
			name: '',
			parent: { type: 'toolbox' }
		},
		{
			id: 'executor-template',
			type: 'executor',
			executor: { type: 'constant-vus', vus: 1, duration: '1m' },
			parent: { type: 'toolbox' }
		},
		{
			id: 'group-template',
			type: 'group',
			name: '',
			parent: { type: 'toolbox' }
		}
	];

	function isCompatible(block: Block, selected: Block | null) {
		if (selected === null) {
			return true;
		}

		switch (selected.type) {
			case 'scenario':
				return block.type === 'executor' || block.type === 'group' || block.type === 'http-request';

			case 'http-request':
			case 'executor':
				return false;

			case 'group':
				return block.type === 'group' || block.type === 'http-request';

			default:
				return exhaustive(selected);
		}
	}
</script>

<div class="toolbox flex flex-col" use:dropmask>
	<ul class="m-4 mr-6 flex flex-auto list-none flex-col rounded-md bg-slate-200 p-0 shadow-md">
		{#each TEMPLATES as template (template.type)}
			<li
				class="border-b border-gray-200 p-2"
				class:opacity-50={!isCompatible(template, $selected)}
			>
				<AnyBlock block={template} />
			</li>
		{/each}
		{#each $requests as template (template.id)}
			<li
				class="border-b border-gray-200 p-2"
				class:opacity-50={!isCompatible(template, $selected)}
			>
				<AnyBlock block={template} />
			</li>
		{/each}
	</ul>
</div>

<style>
	.toolbox {
		transform: translateX(-90%);
		transition: transform 0.3s;
		z-index: 1000;
	}

	.toolbox:hover {
		transform: translateX(0);
	}
</style>
