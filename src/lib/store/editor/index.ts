import { writable } from 'svelte/store';
import type { BlockDocument } from '../test/types';
import type { OpenAPIV3_1 } from 'openapi-types';

interface NewPath {
	type: 'new';
}

interface ExistingPath {
	type: 'existing';
	path: string;
	original: string;
}

type Path = NewPath | ExistingPath;

interface OpenFileBase {
	handle: string;
	name: string;
	path: Path;
}

interface BlockFile extends OpenFileBase {
	type: 'block';
	document: BlockDocument;
}

interface ScriptFile extends OpenFileBase {
	type: 'script';
	script: string;
}

interface LibraryFile extends OpenFileBase {
	type: 'library';
	document: OpenAPIV3_1.Document;
}

type OpenFile = BlockFile | ScriptFile | LibraryFile;

const openFiles = writable<OpenFile[]>([
	{
		handle: '1',
		name: 'Untitled Test',
		path: { type: 'new' },
		type: 'block',
		document: {
			version: 0,
			blocks: []
		}
	}
]);
const currentFile = writable<OpenFile | null>(null);

export {
	openFiles,
	currentFile,
	type OpenFile,
	type BlockFile,
	type ScriptFile,
	type LibraryFile,
	type Path,
	type NewPath,
	type ExistingPath
};
