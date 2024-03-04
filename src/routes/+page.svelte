<script lang="ts">
  import FileBar from "./test/edit/FileBar.svelte";
  import Editor from "./test/edit/Editor.svelte";
  import { invoke } from '@tauri-apps/api/tauri';
  import { onMount } from 'svelte';

  // close the splashscreen when the app is ready
  onMount(() => {
    invoke('close_splashscreen');
  });
</script>

<FileBar />
<Editor />
