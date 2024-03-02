<script lang="ts">
  import { derived } from "svelte/store";
  import { convertToScript } from "$lib/convert";
  import Highlight, { LineNumbers } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import light from "svelte-highlight/styles/github";
  import dark from "svelte-highlight/styles/github-dark";
  import { mode } from "mode-watcher";
  import { blockTest, blocks } from "$lib/store/test";

  let error: unknown = null;

  let script = derived(
    blockTest,
    (test, set) => {
      try {
        convertToScript(test).then((script) => {
          console.log("generated script", { script });

          error = null;
          set(script);
        });
      } catch (e) {
        error = e;
      }
    },
    "",
  );
</script>

<svelte:head>
  {#if $mode === "dark"}
    {@html dark}
  {:else}
    {@html light}
  {/if}
</svelte:head>

{#if error === null}
  <div class="p-4">
    <Highlight language={typescript} code={$script} let:highlighted>
      <LineNumbers {highlighted} />
    </Highlight>
  </div>
{:else}
  <div>
    An error occurred while converting to script. Make sure you've filled in all the required data.
  </div>
{/if}
