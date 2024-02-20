import type { Workspace, Block, Generator } from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';

function defineGenerator(name: string, fn: (block: Block, generator: Generator) => string) {
	javascriptGenerator.forBlock[name] = fn;
}

defineGenerator('k6_test', (block) => {
	const options = block.getInputTargetBlock('OPTIONS');
	const requests_block = block.getInputTargetBlock('REQUESTS');

	const vus = options?.getFieldValue('VUS') ?? 1;
	const duration = options?.getFieldValue('DURATION') ?? 1;

	let defaultFunc = `
          export default function () {
          `;

	let requests_list = [];
	if (requests_block?.type == 'lists_create_with') {
		requests_list = requests_block.getChildren(false);
	} else {
		requests_list = [requests_block];
	}

	for (const request_block of requests_list) {
		const request = request_block?.getFieldValue('REQUEST');

		let check_str = '';
		let check_block = request_block?.getNextBlock();

		while (check_block) {
			const field = check_block.getFieldValue('FIELD');
			const value = check_block.getFieldValue('VALUE');
			const operator = check_block.getFieldValue('OPERATOR');

			check_str += `check(res, { '${field} ${operator} ${value}': (r) => r.${field} ${operator} ${value} });\n`;

			check_block = check_block.getNextBlock();
		}

		defaultFunc += `
              var res = http.get('${request}');
              ${check_str}
          `;
	}

	defaultFunc += `
          sleep(1);
          }`;

	const script = `

          import http from 'k6/http';
          import { sleep, check } from 'k6';

          export const options = {
              vus: ${vus},
              duration: '${duration}s',
          };

          ${defaultFunc}

      `;

	return script;
});

export function convertBlocksToScript(workspace: Workspace) {
	return javascriptGenerator.workspaceToCode(workspace);
}
