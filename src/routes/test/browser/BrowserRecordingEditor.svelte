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
  import DataTable from "./requests-table.svelte";
  import { get } from "svelte/store";
  import { data, newBrowserScript } from "./requests-store";
  import  { selectedDataIds, rows } from "./requests-table.svelte";
  import { goto } from "$app/navigation";

  let unlisten;
  const blockList = [
    "www.google.com",
    "accounts.google.com",
    "play.google.com",
    "www.gstatic.com",
  ];

  onMount(async () => {
    unlisten = await listen('browser-request', (event) => {
      // ignore responses for now

      if (event.payload.response) {
        return;
      }

      // google stuff filtered out
      if (blockList.includes(event.payload.request.host)) {
        return;
      }

      // TODO; improve me
      let request = event.payload.request;
      request["id"] = event.payload.id;
      data.update(items => [...items, request]);
    });
  });

  onDestroy(() => {
    unlisten();

    // cleanup browser resources when exiting the page
    if (!recordingDisabled) {
      stopRecording();
    }
  });


  let recordingDisabled = false;
  let recordingDiscColor = "text-red-600";

  function stopRecording() {
    recordingDisabled = true;
    recordingDiscColor = "";
    appWindow.emit("stop-recorder");
  }

  const baseScriptStart = `
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '30s',
};

export default function () {
`;

const baseScriptEnd = `
  sleep(1);
}
`;

  function createScriptFromIds() {
    let requestsString = [];
    let selectedIds = get(selectedDataIds);
    console.log(selectedIds);

    // if the id is not present when indexing it will return undefined that is considered falsy, #js_stuff
    const selectedData = $rows.filter(row => selectedIds[row.id]);

    for ( const row of selectedData ) {
      const request = row.original;

      // comment line on overall description of request
      const descriptionLine = `  // ${request.method} ${request.scheme}://${request.host}${request.path}\n`;
      requestsString.push(descriptionLine);

      if (request.method === "GET") {
        const requestLine = `  http.get('${request.scheme}://${request.host}${request.path}')\n\n\n`;
        requestsString.push(requestLine);

      } else if (request.method === "POST") {
        const headers = Object.fromEntries(request.headers);
        const headersLine = `  var headers = ${JSON.stringify(headers)}\n`;
        const dataLine = `  var data = ${request.content}\n`;
        const requestLine = `  http.post('${request.scheme}://${request.host}${request.path}', JSON.stringify(data), { headers: headers })\n\n\n`;

        requestsString.push(headersLine);
        requestsString.push(dataLine);
        requestsString.push(requestLine);
      }
    }

    // build the script
    let script = "";
    script += baseScriptStart;
    for (const line of requestsString) {
      script += line;
    }
    script += baseScriptEnd;

    newBrowserScript.set(script);
    goto("/");
  }
</script>

<!-- <div class="flex flex-auto items-center gap-4 bg-white"> -->
<div class="flex items-center gap-4 justify-center mt-5 mb-5">
  <Disc class="{recordingDiscColor}"/>
  {#if recordingDisabled}
    <Button on:click={createScriptFromIds}>Convert selected ids to script...</Button>
  {:else}
    <Button disabled={recordingDisabled} variant="destructive" on:click={stopRecording}>Stop Recording</Button>
  {/if}
  <hr>
</div>

<div class="overflow-y-auto max-h-[700px]">
  <DataTable/>
</div>
