<script lang="ts">
	import type { Block } from '$lib/store/test/types';
	import AnyBlock from './AnyBlock.svelte';
	import { dropmask } from './dnd';

	const TEMPLATES: Block[] = [
		{
			id: 'scenario-template',
			type: 'scenario',
			name: '',
			parent: { type: 'toolbox' }
		},
		{
			id: 'http-request-template',
			type: 'http-request',
			name: 'Some request',
			method: 'GET',
			url: '/some-url',
			parameters: { id: { type: 'string', value: '' } },
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
</script>

<div class="flex flex-col rounded-md bg-slate-200 shadow-md" use:dropmask>
	<ul class="list-none p-0">
		{#each TEMPLATES as template (template.type)}
			<li class="border-b border-gray-200 p-2">
				<AnyBlock block={template} />
			</li>
		{/each}
	</ul>
</div>
