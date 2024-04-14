<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { toast } from "svelte-sonner";
  import { onMount } from "svelte";
  import { Disc } from "lucide-svelte";
  import * as Table from "$lib/components/ui/table";
  import { appWindow } from '@tauri-apps/api/window'

  onMount(() => {

  });

  let recordingDisabled = false;
  let recordingDiscColor = "text-red-600";

  function stopRecording() {
    recordingDisabled = true;
    recordingDiscColor = "";
    appWindow.emit("stop-recorder");
  }
</script>


<!-- <div class="flex flex-auto items-center gap-4 bg-white"> -->
<div class="flex items-center gap-4 justify-center mt-5 mb-5">
  <Disc class="{recordingDiscColor}"/>
  <Button disabled={recordingDisabled} variant="destructive" on:click={stopRecording}>Stop Recording</Button>
  <hr>
</div>



<Table.Root>
  <Table.Caption>A list of your recent invoices.</Table.Caption>
  <Table.Header>
    <Table.Row>
      <Table.Head class="w-[100px]">Invoice</Table.Head>
      <Table.Head>Status</Table.Head>
      <Table.Head>Method</Table.Head>
      <Table.Head class="text-right">Amount</Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    <Table.Row>
      <Table.Cell class="font-medium">INV001</Table.Cell>
      <Table.Cell>Paid</Table.Cell>
      <Table.Cell>Credit Card</Table.Cell>
      <Table.Cell class="text-right">$250.00</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table.Root>


<!-- <div class="flex flex-auto flex-col bg-white"> -->
<!--   <TestToolbar runTest={runTestLocally} {runTestInCloud} saveTest={handleSaveTest} /> -->
<!--   <div class="flex gap-2"> -->
<!--     <ScriptExamples onSelectExample={handleExScript} /> -->
<!--     <Button -->
<!--       size="sm" -->
<!--       variant="ghost" -->
<!--       on:click={() => { -->
<!--         cloudTestDialogOpen = true; -->
<!--       }}>Import script</Button -->
<!--     > -->
<!--   </div> -->
<!--   <ImportDialog bind:open={cloudTestDialogOpen} {setCloudScriptInEditor} /> -->
<!--   <div class="full-w flex-auto" bind:this={container}></div> -->
<!-- </div> -->
