<script lang="ts">
  import * as Tabs from "$lib/components/ui/tabs";
  import ScriptEditor from "./ScriptEditor.svelte";
</script>

<Tabs.Root value="blocks">
  <Tabs.List class="w-full grid grid-cols-2">
    <Tabs.Trigger value="blocks">Blocks</Tabs.Trigger>
    <Tabs.Trigger value="script">Script</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="blocks">
    Make changes to your account here.
  </Tabs.Content>
  <Tabs.Content value="script">
    <ScriptEditor />
  </Tabs.Content>
</Tabs.Root>

