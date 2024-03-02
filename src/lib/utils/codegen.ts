import type { Workspace, Block, Generator } from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';
import {} from 'prettier/parser-typescript.js';
import { format } from 'prettier';
import * as babelParser from 'prettier/parser-babel';
import * as estreePlugin from 'prettier/plugins/estree';

function defineGenerator(name: string, fn: (block: Block, generator: Generator) => string) {
	javascriptGenerator.forBlock[name] = fn;
}

defineGenerator('k6_test', (block, generator) => {
	const options = block.getInputTargetBlock('OPTIONS');

	const requests = generator.statementToCode(block, 'REQUESTS');

	const vus = options?.getFieldValue('VUS') ?? 1;
	const duration = options?.getFieldValue('DURATION') ?? 1;

	const script = `

          import http from 'k6/http';
          import { sleep, check } from 'k6';

          export const options = {
              vus: ${vus},
              duration: '${duration}s',
          };
 
					export default function () {
          	${requests}

						sleep(1);
          }
      `;

	return script;
});

function convertBlocksToScript(workspace: Workspace) {
	const code = javascriptGenerator.workspaceToCode(workspace);

	return format(code, {
		parser: 'babel',
		plugins: [babelParser, estreePlugin]
	});
}

export { defineGenerator, convertBlocksToScript };
