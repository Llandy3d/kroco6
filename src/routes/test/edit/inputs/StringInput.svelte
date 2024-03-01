<script lang="ts" context="module">
	export interface StringInputChangeEvent {
		value: string;
	}
</script>

<script lang="ts">
	import type { InputEvents } from '$lib/components/ui/input';

	import Input from '$lib/components/ui/input/input.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{ change: StringInputChangeEvent }>();

	const change = (ev: InputEvents['change']) => {
		if (ev.target instanceof HTMLInputElement) {
			dispatch('change', { value: ev.target.value });
		}
	};
</script>

<Input {...$$restProps} class="h-6 w-auto bg-white p-1" on:change={change} />
