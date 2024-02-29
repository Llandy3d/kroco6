<script lang="ts">
  import * as Tabs from "$lib/components/ui/tabs";
	import BlocksEditor, { convertBlocksToScript } from "./BlocksEditor.svelte";
  import ScriptEditor from "./ScriptEditor.svelte";

  let script

  function changedTab(tab) {
    if (tab === "script") {
      script = convertBlocksToScript();
    }
  }
</script>

<Tabs.Root value="blocks" onValueChange={changedTab}>
  <Tabs.List class="w-full grid grid-cols-2">
    <Tabs.Trigger value="blocks">Blocks</Tabs.Trigger>
    <Tabs.Trigger value="script">Script</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="blocks">
    <BlocksEditor />
  </Tabs.Content>
  <Tabs.Content value="script">
    <ScriptEditor {script}/>
  </Tabs.Content>
</Tabs.Root>
