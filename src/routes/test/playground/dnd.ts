/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ActionReturn } from 'svelte/action';
import { writable } from 'svelte/store';

interface DraggingState {}

const dragging = writable<DraggingState | null>(null);

interface DragSource<T = unknown> {
	top: number;
	left: number;
	data: T;
}

interface DraggableOptions<T> {
	enabled: boolean;
	data: T;
}

interface DraggableAttributes {
	'on:dragchange'?: (dragging: CustomEvent<DragChangeEvent>) => void;
}

function draggable<T>(
	node: HTMLElement,
	options: DraggableOptions<T>
): ActionReturn<DraggableOptions<T>, DraggableAttributes> {
	let { data } = options;

	const handle = node.querySelector<HTMLElement>('[data-drag-handle]') ?? node;

	const handleMouseDown = (event: MouseEvent) => {
		node.draggable = true;

		event.stopPropagation();
	};

	const handleMouseUp = (event: MouseEvent) => {
		node.draggable = false;

		event.stopPropagation();
	};

	const handleDragStart = (event: DragEvent) => {
		if (event.dataTransfer === null) {
			return;
		}

		const bounds = node.getBoundingClientRect();

		const payload: DragSource<T> = {
			top: event.clientY - bounds.top,
			left: event.clientX - bounds.left,
			data
		};

		event.dataTransfer.setData('application/json', JSON.stringify(payload));
		event.dataTransfer.effectAllowed = 'all';

		dragging.set({});

		node.dispatchEvent(
			new CustomEvent<DragChangeEvent>('dragchange', {
				detail: {
					dragging: true
				}
			})
		);

		event.stopPropagation();
	};

	const handleDragEnd = () => {
		node.draggable = false;

		dragging.set(null);

		node.dispatchEvent(
			new CustomEvent<DragChangeEvent>('dragchange', {
				detail: {
					dragging: false
				}
			})
		);
	};

	node.addEventListener('dragstart', handleDragStart);
	node.addEventListener('dragend', handleDragEnd);

	handle.addEventListener('mousedown', handleMouseDown);
	handle.addEventListener('mouseup', handleMouseUp);

	return {
		update(options) {
			data = options.data;
		},
		destroy() {
			node.removeEventListener('dragstart', handleDragStart);
			node.removeEventListener('dragend', handleDragEnd);

			handle.removeEventListener('mousedown', handleMouseDown);
			handle.removeEventListener('mouseup', handleMouseUp);
		}
	};
}

interface DropZoneOptions<T> {
	data: T;
}

interface DragChangeEvent {
	dragging: boolean;
}

interface AcceptingEvent {
	accepting: boolean;
}

interface DroppingEvent {
	dropping: boolean;
}

interface DroppedEvent<Dropped = unknown, Target = unknown> {
	data: {
		dropped: Dropped;
		target: Target;
	};
	top: number;
	left: number;
}

interface DropZoneAttributes<TargetData> {
	'on:dropped': (event: CustomEvent<DroppedEvent<any, TargetData>>) => void;
	'on:accepting'?: (event: CustomEvent<AcceptingEvent>) => void;
	'on:dropping'?: (event: CustomEvent<DroppingEvent>) => void;
}

function dropzone<TargetData>(
	node: HTMLElement,
	options: DropZoneOptions<TargetData>
): ActionReturn<DropZoneOptions<TargetData>, DropZoneAttributes<TargetData>> {
	let { data: target } = options;

	const handleDragEnter = () => {
		node.dispatchEvent(
			new CustomEvent<DroppingEvent>('dropping', {
				detail: {
					dropping: true
				}
			})
		);
	};

	const handleDragLeave = () => {
		node.dispatchEvent(
			new CustomEvent<DroppingEvent>('dropping', {
				detail: {
					dropping: false
				}
			})
		);
	};

	const handleDragOver = (event: DragEvent) => {
		if (!event.dataTransfer) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		event.dataTransfer.dropEffect = 'move';
	};

	const handleDrop = (event: DragEvent) => {
		if (!event.dataTransfer) {
			return;
		}

		const data = event.dataTransfer.getData('application/json');

		if (data === '') {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		const bounds = node.getBoundingClientRect();

		const source = JSON.parse(data) as DragSource<any>;

		node.dispatchEvent(
			new CustomEvent<DroppedEvent>('dropped', {
				detail: {
					data: {
						dropped: source.data,
						target
					},
					top: event.clientY - bounds.top - source.top,
					left: event.clientX - bounds.left - source.left
				}
			})
		);

		dragging.set(null);
	};

	const unsubscribe = dragging.subscribe((state) => {
		node.dispatchEvent(
			new CustomEvent<AcceptingEvent>('accepting', {
				detail: {
					accepting: state !== null
				}
			})
		);
	});

	node.addEventListener('dragenter', handleDragEnter);
	node.addEventListener('dragleave', handleDragLeave);
	node.addEventListener('dragover', handleDragOver);
	node.addEventListener('drop', handleDrop);

	return {
		update(newOptions) {
			target = newOptions.data;
		},
		destroy() {
			node.removeEventListener('dragenter', handleDragEnter);
			node.removeEventListener('dragleave', handleDragLeave);
			node.removeEventListener('dragover', handleDragOver);
			node.removeEventListener('drop', handleDrop);

			unsubscribe();
		}
	};
}

function dropmask(node: HTMLElement) {
	const handleDragOver = (ev: DragEvent) => {
		ev.preventDefault();
		ev.stopPropagation();
	};

	const handleDrop = (ev: DragEvent) => {
		ev.preventDefault();
		ev.stopPropagation();
	};

	node.addEventListener('dragover', handleDragOver);
	node.addEventListener('drop', handleDrop);

	return {
		destroy() {
			node.removeEventListener('dragover', handleDragOver);
			node.removeEventListener('drop', handleDrop);
		}
	};
}

export {
	draggable,
	dropzone,
	dropmask,
	dragging,
	type DragSource,
	type AcceptingEvent,
	type DroppingEvent,
	type DroppedEvent,
	type DragChangeEvent
};
