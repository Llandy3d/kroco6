<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { toast } from "svelte-sonner";
  import { onMount, onDestroy } from "svelte";
  import { Disc } from "lucide-svelte";
  import * as Table from "$lib/components/ui/table";
  import { appWindow } from '@tauri-apps/api/window'
  import { listen } from '@tauri-apps/api/event'
  import type { BrowserRequest, BrowserResponse, BrowserEvent } from "$lib/browser-types";

  let unlisten;
  let browserRequestResponseList: Array<BrowserEvent> = [];

  let hostFilterValue = "";

  function onFilterValueChange() {
    // trigger the recreation of the table
    browserRequestResponseList = browserRequestResponseList;
  }

  onMount(async () => {
    const unlisten = await listen('browser-request', (event) => {
      console.log(event);
      browserRequestResponseList.push(event.payload);

      // trigger svelte reactivity
      browserRequestResponseList = browserRequestResponseList;
    });
    window.levent = browserRequestResponseList;
  });

  onDestroy(() => {
    unlisten();
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

<div class="max-w-[200px] w-1/4">
  <Input placeholder="Filter by hostname" bind:value={hostFilterValue} on:input={onFilterValueChange} autocomplete="off" />
</div>

<div class="overflow-y-auto max-h-[700px]">
  <Table.Root>
    <Table.Caption>Captured requests</Table.Caption>
    <Table.Header>
      <Table.Row>
        <Table.Head class="w-[100px]">Method</Table.Head>
        <Table.Head>Host</Table.Head>
        <Table.Head>Path</Table.Head>
        <Table.Head class="text-right">Timestamp</Table.Head>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#each browserRequestResponseList as event}
        {#if event.response}
          <!-- todo: fill with status -->
        {:else}
          {#if event.request.host.includes(hostFilterValue)}
            <Table.Row>
              <Table.Cell class="font-medium">{event.request.method}</Table.Cell>
              <!-- <Table.Cell class="max-w-[30px] whitespace-normal">{event.request.host}</Table.Cell> -->
              <!-- <Table.Cell class="max-w-[20px] whitespace-normal text-ellipsis">{event.request.path}</Table.Cell> -->
              <Table.Cell>{event.request.host}</Table.Cell>
              <Table.Cell>{event.request.path}</Table.Cell>
              <Table.Cell class="text-right">{event.request.timestamp_start}</Table.Cell>
            </Table.Row>
          {/if}
        {/if}
      {/each}
    </Table.Body>
  </Table.Root>
</div>
