import type { ActionReturn } from 'svelte/action';

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
	'on:dragged'?: () => void;
}

export function draggable<T>(
	node: HTMLElement,
	options: DraggableOptions<T>
): ActionReturn<DraggableOptions<T>, DraggableAttributes> {
	let { data } = options;

	const handle = node.querySelector<HTMLElement>('[data-drag-handle]') ?? node;

	const handleMouseDown = () => {
		node.draggable = true;
		node.dataset.dragging = 'true';
	};

	const handleMouseUp = () => {
		node.draggable = false;
		node.dataset.dragging = 'false';
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

		event.stopPropagation();
	};

	const handleDragEnd = () => {
		handleMouseUp();

		node.dispatchEvent(new CustomEvent('dragged'));
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

interface DropZoneOptions {}

export type DroppedEvent<T = unknown> = CustomEvent<{
	data: T;
	top: number;
	left: number;
}>;

interface DropZoneAttributes {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	'on:dropped': (event: DroppedEvent<any>) => void;
}

export function dropzone<T>(node: HTMLElement): ActionReturn<DropZoneOptions, DropZoneAttributes> {
	const handleDragStart = (event: DragEvent) => {
		if (event.dataTransfer === null) {
			return;
		}

		console.log('data', event.dataTransfer.getData('application/json'));
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

		const source = JSON.parse(data) as DragSource<T>;

		node.dispatchEvent(
			new CustomEvent<DroppedEvent['detail']>('dropped', {
				detail: {
					data: source.data,
					top: event.clientY - bounds.top - source.top,
					left: event.clientX - bounds.left - source.left
				}
			})
		);
	};

	node.addEventListener('dragover', handleDragOver);
	node.addEventListener('drop', handleDrop);

	window.addEventListener('dragstart', handleDragStart, {
		passive: true
	});

	return {
		update() {},
		destroy() {
			node.removeEventListener('dragover', handleDragOver);
			node.removeEventListener('drop', handleDrop);

			window.removeEventListener('dragstart', handleDragStart);
		}
	};
}
