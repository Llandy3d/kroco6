<script lang="ts">
  import { invoke } from "@tauri-apps/api/tauri";
  import { onMount } from "svelte";
  import Editor from "./test/edit/Editor.svelte";
  import FileBar from "./test/edit/FileTabs.svelte";

  // close the splashscreen when the app is ready
  onMount(() => {
    invoke("close_splashscreen");
  });
</script>

<FileBar />
<div class="flex flex-auto bg-white">
  <Editor />
</div>
