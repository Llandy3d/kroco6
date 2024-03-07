<script lang="ts">
  import { invoke } from "@tauri-apps/api/tauri";
  import { onMount } from "svelte";
  import Editor from "./test/edit/Editor.svelte";

  // close the splashscreen when the app is ready
  onMount(() => {
    invoke("close_splashscreen");
  });
</script>

<Editor />
