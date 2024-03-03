<script lang="ts">
  import { FileCode, Puzzle } from "lucide-svelte";
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
    newFile("block");
  }

  function handleNewScript() {
    newFile("script");
  }
</script>

<div class="flex flex-auto flex-col items-center justify-center gap-6">
  <h2 class="text-xl font-bold">Create a new test</h2>
  <div class="flex items-center justify-center gap-12">
    <button
      class="create-test-button opacity-50 hover:opacity-100"
      data-hover-message="Create a test using our intuitive but powerful block-based builder."
      on:mouseenter={handleMouseEnter}
      on:mouseleave={handleMouseLeave}
      on:click={handleNewBlocks}
    >
      <Puzzle class="h-20 w-20" strokeWidth={0.75} />
      <span>Blocks</span>
    </button>
    <button
      class="create-test-button opacity-50 hover:opacity-100"
      data-hover-message="Unlock the full potential of k6 by writing your tests in JavaScript."
      on:mouseenter={handleMouseEnter}
      on:mouseleave={handleMouseLeave}
      on:click={handleNewScript}
    >
      <FileCode class="h-20 w-20" strokeWidth={0.75} />
      <span>Script</span>
    </button>
  </div>
  <p>{message ?? "Start your journey by creating a test."}</p>
</div>

<style>
  .create-test-button {
    transition: transform 0.3s;
  }

  .create-test-button:hover {
    transform: scale(1.1);
  }
</style>
