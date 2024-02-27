<script lang="ts" generics="Dropped, Target">
	import { createEventDispatcher } from 'svelte';
	import { dropzone, type DroppedEvent, type DroppingEvent, type AcceptingEvent } from './dnd';

	export let data: Target;
	export let accepts: string[] | undefined;

	let accepting = false;
	let dropping = false;

	const dispatch = createEventDispatcher<{ dropped: DroppedEvent<any, Target> }>();

	const handleAccepting = (ev: CustomEvent<AcceptingEvent>) => {
		accepting = ev.detail.accepting;
	};

	const handleDropping = (ev: CustomEvent<DroppingEvent>) => {
		dropping = ev.detail.dropping;
	};

	const handleDropped = (ev: CustomEvent<DroppedEvent<Dropped, Target>>) => {
		dispatch('dropped', ev.detail);

		accepting = false;
		dropping = false;
	};
</script>

<div class="max-h-0">
	<div
		class="drop-zone min-w-8 overflow-visible bg-black opacity-0"
		class:dropping
		class:accepting
		use:dropzone={{ accepts, data }}
		on:accepting={handleAccepting}
		on:dropping={handleDropping}
		on:dropped={handleDropped}
	></div>
</div>

<style>
	.drop-zone {
		transition: height 0.2s;
	}

	.accepting {
		position: relative;
		top: -6px;
		height: 12px;
	}

	.dropping {
		opacity: 0.2;
	}
</style>
