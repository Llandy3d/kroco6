<script lang="ts" context="module">
  export interface ImportEvent {
    api: OpenAPIV3.Document;
  }
</script>

<script lang="ts">
  import type { OpenAPIV3 } from "openapi-types";
  import * as Dialog from "$lib/components/ui/dialog";
  import { createEventDispatcher } from "svelte";
  import { Label } from "$lib/components/ui/label";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { fetch, ResponseType } from "@tauri-apps/api/http";
  import { RefreshCcw } from "lucide-svelte";

  export let open = false;

  let url: string =
    "https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v3.0/petstore.json";

  const dispatch = createEventDispatcher<{
    imported: ImportEvent;
  }>();

  const handleImportClick = () => {
    fetch<string>(url, {
      method: "GET",
      responseType: ResponseType.Text,
    }).then((response) => {
      const api = JSON.parse(response.data) as OpenAPIV3.Document;

      dispatch("imported", {
        api,
      });

      open = false;
    });
  };
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>Sync with OpenAPI</Dialog.Header>
    <Dialog.Description>Sync library with your existing OpenAPI definitions.</Dialog.Description>
    <div class="grid grid-cols-4 items-center gap-4">
      <Label class="text-right">URL</Label>
      <Input id="name" bind:value={url} class="col-span-3" />
    </div>
    <Dialog.Footer>
      <Button class="flex gap-2" on:click={handleImportClick}><RefreshCcw size={14} /> Sync</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
