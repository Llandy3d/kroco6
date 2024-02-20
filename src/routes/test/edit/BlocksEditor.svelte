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

	import { invoke } from '@tauri-apps/api/tauri';

	export let workspace: Blockly.Workspace;

	Blockly.setLocale(En);

	Blockly.defineBlocksWithJsonArray([
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

	// workspace

	const toolbox: Blockly.utils.toolbox.ToolboxInfo = {
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

	function open_run_window() {
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
		workspace = Blockly.inject('blocklyDiv', { toolbox: toolbox });

		const DEFAULT_TEST = {
			blocks: {
				languageVersion: 0,
				blocks: [
					{
						type: 'k6_test',
						id: 'qDKd{qQfn1i.KlgkZyo~',
						x: 40,
						y: 40,
						inputs: {
							OPTIONS: {
								block: {
									type: 'options',
									id: 'gx.#.)q0tl{^|U7jPaKP',
									fields: {
										VUS: 1,
										DURATION: 10
									}
								}
							},
							REQUESTS: {
								block: {
									type: 'http_request',
									id: '#4a0.Cd}9{#|n:6Qzc7R',
									fields: {
										REQUEST: 'https://test.k6.io'
									}
								}
							}
						}
					}
				]
			}
		};

		Blockly.serialization.workspaces.load(DEFAULT_TEST, workspace);
	});
</script>

<div class="-ml-4 h-[79vh]">
	<p class="mt-4 text-center text-2xl text-gray-500">Create your script!</p>

	<Tooltip.Root>
		<Tooltip.Trigger>
			<Button class="mb-1 mt-4 rounded-full" variant="secondary" on:click={open_run_window}>
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
