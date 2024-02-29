<script lang="ts" generics="Dropped, Target">
	function debounce<T extends (...args: any[]) => any>(fn: T, delay: number, maxWait: number) {
		let delayTimeout: number | undefined = undefined;
		let maxWaitTimeout: number | undefined = undefined;

		return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
			clearTimeout(delayTimeout);

			delayTimeout = setTimeout(() => {
				clearTimeout(maxWaitTimeout);
				maxWaitTimeout = undefined;

				fn.apply(this, args);
			}, delay);

			maxWaitTimeout =
				maxWaitTimeout ??
				setTimeout(() => {
					clearTimeout(delayTimeout);
					maxWaitTimeout = undefined;

					fn.apply(this, args);
				}, maxWait);
		};
	}

	import { createEventDispatcher } from 'svelte';
	import { dropzone, type DroppedEvent, type DroppingEvent, type AcceptingEvent } from './dnd';

	export let data: Target;
	export let accepts: string[] | undefined;

	let accepting = false;
	let dropping = false;
	let height = 0;

	const dispatch = createEventDispatcher<{ dropped: DroppedEvent<any, Target> }>();

	const handleAccepting = (ev: CustomEvent<AcceptingEvent>) => {
		accepting = ev.detail.accepting;
	};

	const handleDropping = debounce(
		(ev: CustomEvent<DroppingEvent>) => {
			if (ev.detail.source?.data !== data && ev.detail.dropping) {
				height = ev.detail.source?.node.getBoundingClientRect().height ?? 0;
				dropping = ev.detail.dropping;

				return;
			}

			height = 0;
			dropping = false;
		},
		75,
		200
	);

	const handleDropped = (ev: CustomEvent<DroppedEvent<Dropped, Target>>) => {
		dispatch('dropped', ev.detail);

		accepting = false;
		dropping = false;
		height = 0;
	};
</script>

<div class="drop-zone" class:dropping class:accepting style={`height: ${height}px`}>
	<div
		class="drop-area min-w-8 overflow-visible bg-black opacity-0"
		use:dropzone={{ accepts, data }}
		on:accepting={handleAccepting}
		on:dropping={handleDropping}
		on:dropped={handleDropped}
	></div>
</div>

<style>
	.drop-zone {
		height: 0;
	}

	.drop-area {
		z-index: 1000;
	}

	.drop-zone.accepting .drop-area {
		position: relative;
		top: -8px;
		min-height: 16px;
	}

	.drop-zone.dropping .drop-area {
		opacity: 0.2;
		height: calc(50% + 16px);
	}
</style>
