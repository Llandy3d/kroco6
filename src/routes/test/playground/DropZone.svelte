<script lang="ts" generics="Dropped, Target">
	import { createEventDispatcher } from 'svelte';
	import { dropzone, type DroppedEvent, type DroppingEvent, type AcceptingEvent } from './dnd';

	export let data: Target;

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
	};
</script>

<div class="relative">
	<div
		class="drop-zone bg-black opacity-20"
		class:dropping
		class:accepting
		use:dropzone={{ data }}
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
		height: 8px;
	}

	.dropping {
		opacity: 0.5;
	}
</style>
