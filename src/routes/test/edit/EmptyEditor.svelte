<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import BlockEditorIllustration from "$lib/components/ui/illustrations/BlockEditorIllustration.svelte";
  import ScriptEditorIllustration from "$lib/components/ui/illustrations/ScriptEditorIllustration.svelte";
  import { newFile } from "$lib/stores/editor";

  let message: string | null = null;

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
  </div>
</div>

<style>
  .create-test-button {
    transition: transform 0.3s;
  }

  .create-test-button:hover {
    transform: scale(1.1);
  }
</style>
