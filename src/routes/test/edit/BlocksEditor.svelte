<script lang="ts" context="module">
	function defineBlock(type: string, block: { init: (this: Blockly.Block) => void }) {
		Blockly.Blocks[type] = block;
	}

	Blockly.setLocale(En);

	defineBlock('k6_test', {
		init() {
			this.appendDummyInput().appendField('K6 Test');

			this.appendValueInput('OPTIONS').setCheck('options').appendField('options');

			this.appendStatementInput('REQUESTS');
			this.setColour(160);

			this.setTooltip('');
			this.setHelpUrl('');
		}
	});

	defineBlock('options', {
		init() {
			this.appendDummyInput().appendField('VUs').appendField(new Blockly.FieldNumber(1, 1));
			this.appendDummyInput()
				.appendField('Duration (s)')
				.appendField(new Blockly.FieldNumber(1, 1));

			this.setOutput(true, 'options');
			this.setColour(222);

			this.setTooltip('');
			this.setHelpUrl('');
		}
	});

	defineBlock('http_request', {
		init() {
			this.appendDummyInput()
				.appendField('HTTP GET')
				.appendField(new Blockly.FieldTextInput('https://test.k6.io'), 'REQUEST');

			this.setNextStatement(true, null);
			this.setColour(111);

			this.setOutput(true);

			this.setTooltip('');
			this.setHelpUrl('');
		}
	});

	defineBlock('http_check', {
		init() {
			this.appendDummyInput()
				.appendField('field')
				.appendField(new Blockly.FieldTextInput('status'), 'FIELD')
				.appendField(
					new Blockly.FieldDropdown([
						['==', '=='],
						['!=', '!='],
						['>=', '>='],
						['<=', '<='],
						['>', '>'],
						['<', '<']
					]) as Blockly.Field<string | undefined>,
					'OPERATOR'
				)
				.appendField(new Blockly.FieldTextInput('200'), 'VALUE');

			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setColour(177);

			this.setTooltip('');
			this.setHelpUrl('');
		}
	});
</script>

<script lang="ts">
	// Import Blockly core.
	import * as Blockly from 'blockly/core';
	// Import the default blocks.
	import 'blockly/blocks';
	// Import a generator.
	import { javascriptGenerator } from 'blockly/javascript';
	// Import a message file.
	import * as En from 'blockly/msg/en';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { PlayCircle, UploadCloud } from 'lucide-svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { ResponseType, fetch } from '@tauri-apps/api/http';

	import { invoke } from '@tauri-apps/api/tauri';
	import type { OpenAPI } from 'openapi-types';
	import { defineGenerator } from '../../../utils/codegen';

	export let workspace: Blockly.WorkspaceSvg;

	// workspace

	const DEFAULT_TOOLBOX: Blockly.utils.toolbox.ToolboxInfo = {
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

	fetch<string>(
		'https://raw.githubusercontent.com/davidkpiano/openapi-test/master/examples/swapi.json',
		{
			method: 'GET',
			responseType: ResponseType.Text
		}
	).then((response) => {
		const api = JSON.parse(response.data) as OpenAPI.Document;

		if (api.paths === undefined) {
			return;
		}

		const toolbox: Blockly.utils.toolbox.ToolboxInfo = {
			kind: 'flyoutToolbox',
			contents: [...DEFAULT_TOOLBOX.contents]
		};

		if ('swagger' in api) {
			Object.entries(api.paths).forEach(([path, methods]) => {
				if (methods === undefined) {
					return;
				}

				Object.entries(methods).forEach(([method, operation]) => {
					if (typeof operation !== 'object' || !('operationId' in operation)) {
						return;
					}

					const id = operation.operationId ?? `${method} ${path}`;
					const parameters = operation.parameters ?? [];

					defineBlock(id, {
						init() {
							this.appendDummyInput().appendField(
								operation.summary ?? operation.description ?? `${method} ${path}`
							);

							parameters.forEach((parameter) => {
								if (!('name' in parameter)) {
									return;
								}

								this.appendDummyInput()
									.setAlign(Blockly.inputs.Align.RIGHT)
									.appendField(parameter.description ?? parameter.name)
									.appendField(new Blockly.FieldTextInput(parameter.default), parameter.name);
							});

							this.setPreviousStatement(true, null);
							this.setNextStatement(true, null);

							this.setColour(111);

							if (operation.description !== undefined) {
								this.setTooltip(operation.description);
							}

							if (operation.externalDocs !== undefined) {
								this.setHelpUrl(operation.externalDocs.url);
							}
						}
					});

					defineGenerator(id, (block) => {
						const requestPath = parameters.reduce((path, parameter) => {
							if (!('name' in parameter)) {
								return path;
							}

							if (parameter.in !== 'path') {
								return path;
							}

							return path.replace(`{${parameter.name}}`, block.getFieldValue(parameter.name));
						}, path);

						return `http.${method}(${JSON.stringify(requestPath)});\n`;
					});

					toolbox.contents.push({
						kind: 'block',
						type: id
					});
				});
			});

			workspace.updateToolbox(toolbox);

			return;
		}

		Object.entries(api.paths).forEach(([path, methods]) => {
			if (methods === undefined) {
				return;
			}

			Object.entries(methods).forEach(([method, operation]) => {
				console.log(path, method, operation);
			});
		});
	});

	function openRunWindow() {
		const script = javascriptGenerator.workspaceToCode(workspace);

		invoke('open_run_window', { script: script })
			.then((response) => {
				console.log(response);
			})
			.catch((error) => {
				console.log(error);
			});
	}

	onMount(() => {
		workspace = Blockly.inject('blocklyDiv', {
			toolbox: DEFAULT_TOOLBOX,
			renderer: 'thrasos',
			theme: 'modern'
		});

		// const DEFAULT_TEST = {
		// 	blocks: {
		// 		languageVersion: 0,
		// 		blocks: [
		// 			{
		// 				type: 'k6_test',
		// 				id: 'qDKd{qQfn1i.KlgkZyo~',
		// 				x: 40,
		// 				y: 40,
		// 				inputs: {
		// 					OPTIONS: {
		// 						block: {
		// 							type: 'options',
		// 							id: 'gx.#.)q0tl{^|U7jPaKP',
		// 							fields: {
		// 								VUS: 1,
		// 								DURATION: 10
		// 							}
		// 						}
		// 					},
		// 					REQUESTS: {
		// 						block: {
		// 							type: 'http_request',
		// 							id: '#4a0.Cd}9{#|n:6Qzc7R',
		// 							fields: {
		// 								REQUEST: 'https://test.k6.io'
		// 							}
		// 						}
		// 					}
		// 				}
		// 			}
		// 		]
		// 	}
		// };

		// Blockly.serialization.workspaces.load(DEFAULT_TEST, workspace);

		return () => {
			workspace.dispose();
		};
	});
</script>

<div class="-ml-4 h-[79vh]">
	<p class="mt-4 text-center text-2xl text-gray-500">Create your script!</p>

	<Tooltip.Root>
		<Tooltip.Trigger>
			<Button class="mb-1 mt-4 rounded-full" variant="secondary" on:click={openRunWindow}>
				<PlayCircle class="mr-2 h-4 w-4" />
				Run
			</Button>
		</Tooltip.Trigger>
		<Tooltip.Content>
			<p>Run locally</p>
		</Tooltip.Content>
	</Tooltip.Root>

	<Tooltip.Root>
		<Tooltip.Trigger>
			<Button class="mb-1 mt-4 rounded-full" variant="secondary" disabled>
				<UploadCloud class="mr-2 h-4 w-4" />
				Run in Cloud
			</Button>
		</Tooltip.Trigger>
		<Tooltip.Content>
			<p>Account required for cloud tests!</p>
		</Tooltip.Content>
	</Tooltip.Root>

	<div id="blocklyDiv" class="h-full"></div>
</div>
