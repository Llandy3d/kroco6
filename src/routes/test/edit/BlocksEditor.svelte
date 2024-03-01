<script context="module">
	let workspace;

	export function convertBlocksToScript() {
		return javascriptGenerator.workspaceToCode(workspace);
	}
</script>

<script lang="ts">
	// Import Blockly core.
	import * as Blockly from 'blockly/core';
	// Import the default blocks.
	import * as libraryBlocks from 'blockly/blocks';
	// Import a generator.
	import { javascriptGenerator } from 'blockly/javascript';
	// Import a message file.
	import * as En from 'blockly/msg/en';
	import { onMount } from 'svelte';

	import { invoke } from '@tauri-apps/api/tauri';
	import { open } from '@tauri-apps/api/shell';
	import TestToolbar from './TestToolbar.svelte';
	import { runScriptInCloud } from '$lib/backend-client';

	Blockly.setLocale(En);

	const definitions = Blockly.defineBlocksWithJsonArray([
		{
			// The type is like the "class name" for your block. It is used to construct
			// new instances. E.g. in the toolbox.
			type: 'k6_test',
			colour: 160,
			// The message defines the basic text of your block, and where inputs or
			// fields will be inserted.
			message0: 'K6 Test',
			message1: 'options %1',
			args1: [
				// Each arg is associated with a %# in the message.
				// This one gets substituted for %1.
				{
					type: 'input_value',
					name: 'OPTIONS',
					check: 'options'
				}
			],
			message2: 'requests %1',
			args2: [
				// Each arg is associated with a %# in the message.
				// This one gets substituted for %1.
				{
					type: 'input_value',
					name: 'REQUESTS'
				}
			],
			// Adds an untyped next connection to the bottom of the block.
			nextStatement: null
		},
		{
			type: 'options',
			colour: 222,
			output: null,
			// The message defines the basic text of your block, and where inputs or
			// fields will be inserted.
			message0: 'VUS %1',
			args0: [
				// Each arg is associated with a %# in the message.
				// This one gets substituted for %1.
				{
					type: 'field_number',
					name: 'VUS',
					value: 1
				}
			],
			message1: 'duration(s) %1',
			args1: [
				{
					type: 'field_number',
					name: 'DURATION',
					value: 10
				}
			]
		},
		{
			type: 'http_request',
			colour: 111,
			output: null,
			// The message defines the basic text of your block, and where inputs or
			// fields will be inserted.
			message0: 'HTTP GET %1',
			args0: [
				// Each arg is associated with a %# in the message.
				// This one gets substituted for %1.
				{
					type: 'field_input',
					name: 'REQUEST',
					text: 'https://test.k6.io'
				}
			],
			nextStatement: null
		},
		{
			type: 'http_check',
			colour: 177,
			// The message defines the basic text of your block, and where inputs or
			// fields will be inserted.
			message0: 'check',
			message0: 'field %1 %3 value %2',
			args0: [
				{
					type: 'field_input',
					name: 'FIELD',
					text: 'status'
				},
				{
					type: 'field_input',
					name: 'VALUE'
				},
				{
					type: 'field_dropdown',
					name: 'OPERATOR',
					options: [
						['==', '=='],
						['!=', '!='],
						['>=', '>='],
						['<=', '<='],
						['>', '>'],
						['<', '<']
					]
				}
			],
			previousStatement: null,
			nextStatement: null
		}
	]);

	// code generator

	javascriptGenerator.forBlock['k6_test'] = function (block, generator) {
		const steps = block.getFieldValue('FIELD_NAME');
		const options = block.getInputTargetBlock('OPTIONS');
		const requests_block = block.getInputTargetBlock('REQUESTS');

		const vus = options.getFieldValue('VUS');
		const duration = options.getFieldValue('DURATION');

		var default_func = `
            export default function () {
            `;

		let requests_list = [];
		if (requests_block.type == 'lists_create_with') {
			requests_list = requests_block.getChildren();
		} else {
			requests_list = [requests_block];
		}

		for (const request_block of requests_list) {
			const request = request_block.getFieldValue('REQUEST');

			var check_str = '';
			var check_block = request_block.getNextBlock();
			while (check_block) {
				const field = check_block.getFieldValue('FIELD');
				const value = check_block.getFieldValue('VALUE');
				const operator = check_block.getFieldValue('OPERATOR');

				check_str += `check(res, { '${field} ${operator} ${value}': (r) => r.${field} ${operator} ${value} });\n`;

				check_block = check_block.getNextBlock();
			}

			default_func += `
                var res = http.get('${request}');
                ${check_str}
            `;
		}

		default_func += `
            sleep(1);
            }`;

		const script = `

            import http from 'k6/http';
            import { sleep, check } from 'k6';

            export const options = {
                vus: ${vus},
                duration: '${duration}s',
            };

            ${default_func}

        `;

		return script;
	};

	// workspace
	const toolbox = {
		// There are two kinds of toolboxes. The simpler one is a flyout toolbox.
		kind: 'flyoutToolbox',
		// The contents is the blocks and other items that exist in your toolbox.
		contents: [
			{
				kind: 'block',
				type: 'k6_test'
			},
			{
				kind: 'block',
				type: 'options'
			},
			{
				kind: 'block',
				type: 'http_request'
			},
			{
				kind: 'block',
				type: 'http_check'
			},
			{
				kind: 'block',
				type: 'lists_create_with'
			}
		]
	};

	function runTestLocally() {
		const script = javascriptGenerator.workspaceToCode(workspace);

		invoke('open_run_window', { script: script })
			.then((response) => {
				console.log(response);
			})
			.catch((error) => {
				console.log(error);
			});
	}

	function runTestInCloud(projectId: string) {
		const script = javascriptGenerator.workspaceToCode(workspace);

		runScriptInCloud({ script, projectId })
			.then((response) => {
				console.log(response);

				let match = response.match(/output: (https?:\/\/[^\s]+)/);

				if (match) {
					open(match[1]);
				} else {
					throw new Error('No URL found in output');
				}
			})
			.catch((error) => {
				console.log(error);
			});
	}

	onMount(() => {
		workspace = Blockly.inject('blocklyDiv', { toolbox: toolbox });

		let k6_block = workspace.newBlock('k6_test');
		let options_block = workspace.newBlock('options');
		let request_block = workspace.newBlock('http_request');

		k6_block.getInput('OPTIONS')?.connection?.connect(options_block.outputConnection);
		k6_block.getInput('REQUESTS')?.connection?.connect(request_block.outputConnection);

		// make it more centered in the workspace
		k6_block.moveBy(40, 40);

		k6_block.initSvg();
		options_block.initSvg();
		request_block.initSvg();
		workspace.render();
	});
</script>

<div class="-ml-4 h-[79vh]">
	<TestToolbar runTest={runTestLocally} {runTestInCloud} />

	<div id="blocklyDiv" class="h-full"></div>
</div>
