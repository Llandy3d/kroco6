import type { OpenAPIV3_1 } from 'openapi-types';
import type { OpenFile } from './store/editor';
import { EMPTY_BLOCK_TEST, type BlockTest } from './store/test/types';

const NEW_BLOCKS_TEST = JSON.stringify(EMPTY_BLOCK_TEST);

const NEW_SCRIPT = '';

function loadContent(file: OpenFile): string {
	const data = sessionStorage.getItem(file.handle);

	if (data === null) {
		if (file.path.type === 'new') {
			switch (file.type) {
				case 'block':
					return NEW_BLOCKS_TEST;

				case 'script':
					return NEW_SCRIPT;
			}
		}

		return file.path.original;
	}

	return data;
}

function storeContent(file: OpenFile, content: BlockTest | string | OpenAPIV3_1.Document) {
	sessionStorage.setItem(
		file.handle,
		typeof content === 'string' ? content : JSON.stringify(content)
	);
}

export { loadContent, storeContent };
