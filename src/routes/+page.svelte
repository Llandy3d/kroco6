<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<div id="blocklyDiv" style="height: 480px; width: 1200px;"></div>


<script>
// Import Blockly core.
import * as Blockly from 'blockly/core';
// Import the default blocks.
import * as libraryBlocks from 'blockly/blocks';
// Import a generator.
import {javascriptGenerator} from 'blockly/javascript';
// Import a message file.
import * as En from 'blockly/msg/en';
	import { onMount } from 'svelte';

Blockly.setLocale(En);
const toolbox = {
  kind: 'flyoutToolbox',
  contents: [
    {
      kind: 'block',
      type: 'controls_if'
    },
    {
      kind: 'block',
      type: 'controls_whileUntil'
    }
  ]
};

onMount(() => {
    const workspace = Blockly.inject('blocklyDiv', { toolbox: toolbox });
});

  import { toast } from "svelte-sonner";
  import { Button } from "$lib/components/ui/button";
</script>

<Button on:click={() => toast.success("Hello world")}>Show toast</Button>
