<script lang="ts">
  import { invoke } from "@tauri-apps/api";
  import { setMode } from "mode-watcher";
  import { onMount } from "svelte";
  import Editor from "./test/edit/Editor.svelte";

  onMount(() => {
    setMode("light");

    invoke("close_splashscreen");
  });
</script>

<Editor />
