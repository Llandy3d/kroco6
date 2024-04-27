<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import BlockEditorIllustration from "$lib/components/ui/illustrations/BlockEditorIllustration.svelte";
  import ScriptEditorIllustration from "$lib/components/ui/illustrations/ScriptEditorIllustration.svelte";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Progress } from "$lib/components/ui/progress/index.js";
  import { newFile } from "$lib/stores/editor";
  import { invoke } from "@tauri-apps/api";
  import { once, listen } from '@tauri-apps/api/event'
  import { goto } from '$app/navigation';

  let message: string | null = null;
  let browserDialogOpen: boolean = false;
  let browserProxyingProgress: number = 0;

  function browserProxyingAnimation() {
    setInterval(() => (browserProxyingProgress += 10), 1000);
  }

  function handleMouseEnter(event: MouseEvent) {
    if (event.target instanceof HTMLButtonElement) {
      message = event.target.dataset.hoverMessage ?? null;
    }
  }

  function handleMouseLeave() {
    message = null;
  }

  function handleNewBlocks() {
    newFile({
      type: "block",
    });
  }

  function handleNewScript() {
    newFile({
      type: "script",
    });
  }

  async function handleNewBrowser() {
    browserDialogOpen = true;
    browserProxyingAnimation();

    await once("browser-started", (event) => {
      console.log(event);
      goto("/test/browser");

      browserDialogOpen = false;
      browserProxyingProgress = 0;
    });

    invoke("open_browser");
  }
</script>

<div class="flex flex-auto flex-col items-center">
  <h1 class="mb-3 mt-32 text-3xl">Create new test</h1>
  <h2 class="mb-8 font-thin">Start your journey by choosing a type of test</h2>
  <div class="flex items-center justify-center gap-12">
    <div class="flex w-64 flex-col items-center">
      <BlockEditorIllustration class="my-2" />
      <h3 class="my-3 text-xl">Block test</h3>
      <p class="mb-4 text-center font-thin">
        Use our interactive UI to compose GET, POST, DELETE and more requests.
      </p>
      <Button on:click={handleNewBlocks}>Start building</Button>
    </div>
    <div class="flex w-64 flex-col items-center">
      <ScriptEditorIllustration class="my-2" />
      <h3 class="my-3 text-xl">Script test</h3>
      <p class="mb-4 text-center font-thin">
        Use our code samples as a foundation for your script or start from a clean slate.
      </p>
      <Button variant="outline" on:click={handleNewScript}>Start scripting</Button>
    </div>
    <div class="flex w-64 flex-col items-center">
      <BlockEditorIllustration class="my-2" />
      <h3 class="my-3 text-xl">Browser test</h3>
      <p class="mb-4 text-center font-thin">
        Generate a script by browsing with a browser. This will generate a normal test.
      </p>
      <Button variant="outline" on:click={handleNewBrowser}>Start browsing</Button>
    </div>
  </div>
</div>

<Dialog.Root bind:open={browserDialogOpen} closeOnEscape={false} closeOnOutsideClick={false}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title class="text-center">Proxifying your browser...</Dialog.Title>
      <Dialog.Description>
        <br>
        <Progress value={browserProxyingProgress} max={100}  />
      </Dialog.Description>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>

<style>
  .create-test-button {
    transition: transform 0.3s;
  }

  .create-test-button:hover {
    transform: scale(1.1);
  }
</style>
