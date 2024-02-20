<script lang="ts">
	import * as Blockly from 'blockly/core';
	import * as Tabs from '$lib/components/ui/tabs';
	import BlocksEditor from './BlocksEditor.svelte';
	import ScriptEditor from './ScriptEditor.svelte';
	import { convertBlocksToScript } from '../../../utils/codegen';

	let script: string;
	let workspace: Blockly.Workspace;

	function changedTab(tab: string | undefined) {
		if (tab === 'script') {
			script = convertBlocksToScript(workspace);
		}
	}
</script>

<Tabs.Root value="blocks" onValueChange={changedTab}>
	<Tabs.List class="grid w-full grid-cols-2">
		<Tabs.Trigger value="blocks">Blocks</Tabs.Trigger>
		<Tabs.Trigger value="script">Script</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="blocks">
		<BlocksEditor bind:workspace />
	</Tabs.Content>
	<Tabs.Content value="script">
		<ScriptEditor {script} />
	</Tabs.Content>
</Tabs.Root>
