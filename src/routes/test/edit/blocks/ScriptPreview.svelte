<script lang="ts">
  import { test } from "$lib/stores/blocks";
  import { convertToScript } from "$lib/stores/blocks/convert";
  import { EMPTY_ENVIRONMENT, currentEnvironment } from "$lib/stores/projects";
  import { mode } from "mode-watcher";
  import Highlight, { LineNumbers } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import light from "svelte-highlight/styles/github";
  import dark from "svelte-highlight/styles/github-dark";
  import { derived } from "svelte/store";

  let error: unknown = null;

  let script = derived(
    test,
    (test, set) => {
      const env = $currentEnvironment ?? EMPTY_ENVIRONMENT;

      try {
        convertToScript(env, test).then((script) => {
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
  <div class="flex h-full items-center justify-center">
    An error occurred while converting to script. Make sure you've filled in all the required data.
  </div>
{/if}
