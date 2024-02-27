/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ActionReturn } from 'svelte/action';
import { writable } from 'svelte/store';

const dragging = writable<DragSource<any> | null>(null);

interface DragSource<T = unknown> {
	top: number;
	left: number;
	type: string;
	data: T;
}

interface DraggableOptions<T> {
	type: string;
	data: T;
}

interface DraggableAttributes {
	'on:dragchange'?: (dragging: CustomEvent<DragChangeEvent>) => void;
}

function draggable<T>(
	node: HTMLElement,
	options: DraggableOptions<T>
): ActionReturn<DraggableOptions<T>, DraggableAttributes> {
	let { type, data } = options;

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
			type,
			data
		};

		event.dataTransfer.setData('application/json', JSON.stringify(payload));
		event.dataTransfer.effectAllowed = 'all';

		dragging.set(payload);

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
			type = options.type;
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
	accepts?: string[];
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
	let source: DragSource<any> | null = null;

	let { accepts, data: target } = options;

	const isAcceptable = (source: DragSource<unknown> | null): source is DragSource => {
		if (source === null) {
			return false;
		}

		return accepts === undefined || accepts.includes(source.type);
	};

	const handleDragEnter = () => {
		if (!isAcceptable(source)) {
			return;
		}

		node.dispatchEvent(
			new CustomEvent<DroppingEvent>('dropping', {
				detail: {
					dropping: true
				}
			})
		);
	};

	const handleDragLeave = () => {
		if (!isAcceptable(source)) {
			return;
		}

		node.dispatchEvent(
			new CustomEvent<DroppingEvent>('dropping', {
				detail: {
					dropping: false
				}
			})
		);
	};

	const handleDragOver = (event: DragEvent) => {
		if (event.dataTransfer === null) {
			return;
		}

		if (!isAcceptable(source)) {
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

		if (!isAcceptable(source)) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		const bounds = node.getBoundingClientRect();

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
		source = state;

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
			accepts = options.accepts;
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
