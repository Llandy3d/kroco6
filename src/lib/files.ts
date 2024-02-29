import type { OpenAPIV3_1 } from 'openapi-types';
import type { OpenFile } from './store/editor';
import type { BlockDocument } from './store/test/types';

const NEW_BLOCKS_TEST = JSON.stringify({
	version: 0,
	blocks: []
} satisfies BlockDocument);

const NEW_SCRIPT = '';

const NEW_LIBRARY = JSON.stringify({
	info: {
		title: 'Untitled API',
		version: '1.0.0'
	},
	openapi: '3.0.0',
	paths: {}
} satisfies OpenAPIV3_1.Document);

function loadContent(file: OpenFile): string {
	const data = sessionStorage.getItem(file.handle);

	if (data === null) {
		if (file.path.type === 'new') {
			switch (file.type) {
				case 'block':
					return NEW_BLOCKS_TEST;

				case 'script':
					return NEW_SCRIPT;

				case 'library':
					return NEW_LIBRARY;
			}
		}

		return file.path.original;
	}

	return data;
}

function storeContent(file: OpenFile, content: BlockDocument | string | OpenAPIV3_1.Document) {
	sessionStorage.setItem(
		file.handle,
		typeof content === 'string' ? content : JSON.stringify(content)
	);
}

export { loadContent, storeContent };
